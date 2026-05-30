import { Client, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { CoversationResponse, message, messageResponse } from "./webSocket.Interface";
import { api, ApiResponse } from "../api";
import { webSocketApiEndpoints } from "./webSocket.ApiEndpoints";

class WebSoketService {
    private client : Client|null = null;
    private isConnected : boolean = false;
    private subscriptions: Map<string, StompSubscription> = new Map();
    private baseUrl = process.env.NEXT_PUBLIC_API_URL;

    connect():Promise<void> {
        return new Promise((resolve, reject) => {
           this.client = new Client({
                webSocketFactory: () => {
                   return new SockJS(`${this.baseUrl}/ws`);
                },
                reconnectDelay:5000,
                onConnect:()=>{
                    this.isConnected=true
                    console.log("connected to ws");
                    resolve();
                },
                onDisconnect:()=>{
                    this.isConnected=false;
                    console.log("disconnected from ws");
                },
                onStompError: (frame) => {
                        console.error('STOMP error:', frame.headers['message']);
                        reject(new Error(frame.headers['message']));
                    },

                onWebSocketError: (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                }
           });
           this.client.activate();
        })
    }
    disconnect(): void {
        // Unsubscribe from all topics first
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions.clear();

        // Then close connection
        this.client?.deactivate();
        this.isConnected = false;
        console.log('WebSocket disconnected ✅');
    }
    subscribeToConversation(
        conversationId:string,
        onMessage: (msg: message)=>void):void{
            const key = `conversation.${conversationId}`;

            if(this.subscriptions.has(key))return;
            if (!this.client || !this.client.connected) {
                console.warn("STOMP client not connected, skipping subscription for key:", key);
                return;
            }

            const sub = this.client.subscribe(
                `/topic/conversation/${conversationId}`,
                (frame) => {
                    const message = JSON.parse(frame.body);
                    onMessage(message);
                }
            );

        this.subscriptions.set(key, sub);
    }
    unsubscribeFromConversation(conversationId: string): void {
        const key = `conversation.${conversationId}`;
        this.subscriptions.get(key)?.unsubscribe();
        this.subscriptions.delete(key);
    }

    
    subscribeToReadReceipts(
        conversationId: string,
        onRead: (readerId: string) => void
    ): void {
        const key = `read.${conversationId}`;
        if (this.subscriptions.has(key)) return;
        if (!this.client || !this.client.connected) {
            console.warn('STOMP client not connected, skipping read-receipt subscription for:', key);
            return;
        }

        const sub = this.client.subscribe(
            `/topic/conversation/${conversationId}/read`,
            (frame) => {
                // Payload is a plain userId string
                const readerId = frame.body.replace(/"/g, '');
                onRead(readerId);
            }
        );
        this.subscriptions.set(key, sub);
    }

    unsubscribeFromReadReceipts(conversationId: string): void {
        const key = `read.${conversationId}`;
        this.subscriptions.get(key)?.unsubscribe();
        this.subscriptions.delete(key);
    }
    private callbacks: Map<string, (data: any) => void> = new Map();

    subscribeToInboxUpdates(onUpdate: (update: any) => void): void {
        const key = 'inbox-update';
        this.callbacks.set(key, onUpdate);

        if (this.subscriptions.has(key)) return;
        if (!this.client || !this.client.connected) {
            console.warn("STOMP client not connected, skipping subscription for key:", key);
            return;
        }

        const sub = this.client.subscribe(
            '/user/queue/inbox-update',
            (frame) => {
                const update = JSON.parse(frame.body);
                const currentCallback = this.callbacks.get(key);
                if (currentCallback) {
                    currentCallback(update);
                }
            }
        );

        this.subscriptions.set(key, sub);
    }
    subscribeToTyping(onTyping: (res: any) => void): void {
        const key = 'typing';
        this.callbacks.set(key, onTyping);

        if (this.subscriptions.has(key)) return;
        if (!this.client || !this.client.connected) {
            console.warn("STOMP client not connected, skipping subscription for key:", key);
            return;
        }

        const sub = this.client.subscribe(
            '/user/queue/typing',
            (frame) => {
                const typing = JSON.parse(frame.body);
                const currentCallback = this.callbacks.get(key);
                if (currentCallback) {
                    currentCallback(typing);
                }
            }
        );

        this.subscriptions.set(key, sub);
    }
    subscribeToOnlineStatus(onStatus: (status: any) => void): void {
        const key = 'online-status';
        this.callbacks.set(key, onStatus);

        if (this.subscriptions.has(key)) return;
        if (!this.client || !this.client.connected) {
            console.warn("STOMP client not connected, skipping subscription for key:", key);
            return;
        }

        const sub = this.client.subscribe(
            '/user/queue/online-status',
            (frame) => {
                const status = JSON.parse(frame.body);
                const currentCallback = this.callbacks.get(key);
                if (currentCallback) {
                    currentCallback(status);
                }
            }
        );

        this.subscriptions.set(key, sub);
    }
    sendMessage(conversationId: string, message: message): void {
        if (!this.client || !this.client.connected) {
            console.error('WebSocket not connected');
            return;
        }

        this.client!.publish({
            destination: '/app/chat.send',
            body: JSON.stringify({ 
                conversationId,
                content: message.content,
                messageType: message.messageType,
                attachmentUrl: message.attachmentUrl
            })
        });
    }
    sendTyping(conversationId: string, isTyping: boolean): void {
        if (!this.client || !this.client.connected) return;

        this.client!.publish({
            destination: '/app/chat.typing',
            body: JSON.stringify({ conversationId, isTyping })
        });
    }
     markAsRead(conversationId: string): void {
        if (!this.client || !this.client.connected) return;

        this.client!.publish({
            destination: '/app/chat.read',
            body: conversationId
        });
    }

    getIsConnected(): boolean {
        return this.client !== null && this.client.connected;
    }

    async getChatsConversations(page?:number,size?:number): Promise<ApiResponse<CoversationResponse[]>> {
        try {
            const res = await api.get<CoversationResponse[]>(webSocketApiEndpoints.chatsConversations,{params:{page,size}});
            return res;
        } catch (e) {
            throw e;
        }
    }
    async getChatsConversationsMessages(conversationId:string, size:number=20, page:number=0, search?:string): Promise<ApiResponse<messageResponse[]>> {
        try {
            const res = await api.get<messageResponse[]>(`${webSocketApiEndpoints.chatsConversationsMessages.replace('{conversationId}', conversationId)}?page=${page}&size=${size}${search ? `&search=${search}` : ''}`);
            return res;
        } catch (e) {
            throw e;
        }
    }
}

const webSocketService = new WebSoketService();

export default webSocketService;
