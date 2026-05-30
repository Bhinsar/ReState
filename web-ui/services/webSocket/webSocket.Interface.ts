import { UserRes } from "../users/user.Interface";

export interface message {
    content?: string;
    attachmentUrl?: string;
    messageType:string;
}

export enum messageType {
    TEXT = 'TEXT',
    FILE = 'FILE',
    IMAGE = 'IMAGE',
    LINK = 'LINK',
    SYSTEM = 'SYSTEM'
}

export interface messageResponse {
    id: string;
    content?: string;
    sender: otherParticipant;  
    messageType: messageType;
    attachmentUrl?: string;
    isRead: boolean;
    sentAt: Date;
}
export interface CoversationResponse {
    conversationId: string,
    otherParticipant: otherParticipant,
    unreadMessageCount: number,
    lastMessageContent: string,
    lastMessageTime: Date,
    status: ConversationStatus
}

export enum ConversationStatus {
    ACTIVE = 'ACTIVE',
    BLOCK = 'BLOCK'
}

export interface otherParticipant {
    id: string;
    firstName: string;
    lastName: string;
    email:string
    avatarUrl?: string;
    isOnline: boolean;
    lastSeen: Date;
    createdAt: Date;
}