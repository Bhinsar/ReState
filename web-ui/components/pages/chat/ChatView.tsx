"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import webSocketService from "@/services/webSocket/webSoket.Service";
import { MediaService } from "@/services/media/media.Service";
import {
  CoversationResponse,
  messageResponse,
  messageType,
} from "@/services/webSocket/webSocket.Interface";
import {
  UserRes,
  UserRole,
  RegisterStep,
} from "@/services/users/user.Interface";
import { Image as ImageIcon, Search, X, MessageSquare } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Import Refactored Modular Components
import ConversationListSidebar from "./components/ConversationListSidebar";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import Lightbox from "./components/Lightbox";

export default function ChatView() {
  const { user } = useAuthStore();

  // Chat States
  const [conversations, setConversations] = useState<CoversationResponse[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<CoversationResponse | null>(null);
  const [messages, setMessages] = useState<messageResponse[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatSearchText, setChatSearchText] = useState("");
  const [messageSearchText, setMessageSearchText] = useState("");
  const [isSearchingMessages, setIsSearchingMessages] = useState(false);

  // Connection and Loading States
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Interactive UI States
  const [isDragging, setIsDragging] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [mobileActiveView, setMobileActiveView] = useState<"list" | "chat">(
    "list",
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // 1. Initial Connection & Fetch Conversations
  useEffect(() => {
    const initSocket = async () => {
      try {
        if (!webSocketService.getIsConnected()) {
          console.log("WebSocket connecting...");
          await webSocketService.connect();
        }
        setSocketConnected(true);
        loadConversations();
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        toast.error("Real-time service unavailable. Reconnecting...");
        setIsLoadingConversations(false);
      }
    };

    initSocket();

    return () => {
      if (selectedConversation) {
        webSocketService.unsubscribeFromConversation(
          selectedConversation.conversationId,
        );
      }
    };
  }, []);

  // 2. Fetch Conversations from API
  const loadConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const res = await webSocketService.getChatsConversations();
      if (res.success && res.data) {
        setConversations(res.data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // URL Query Sync - Initial Load: Select conversation from URL parameter
  useEffect(() => {
    if (typeof window === "undefined" || conversations.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const urlConvoId = params.get("id") || params.get("conversationId");

    if (urlConvoId && !selectedConversation) {
      const matchedConvo = conversations.find(
        (c) => c.conversationId === urlConvoId
      );
      if (matchedConvo) {
        setSelectedConversation(matchedConvo);
        setMobileActiveView("chat");
      }
    }
  }, [conversations, selectedConversation]);

  // URL Query Sync - Update URL when selected conversation changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const currentId = params.get("id") || params.get("conversationId");

    if (selectedConversation) {
      if (currentId !== selectedConversation.conversationId) {
        params.set("id", selectedConversation.conversationId);
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}?${params.toString()}`
        );
      }
    } else {
      if (currentId) {
        params.delete("id");
        params.delete("conversationId");
        const queryStr = params.toString();
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}${queryStr ? `?${queryStr}` : ""}`
        );
      }
    }
  }, [selectedConversation]);

  // 3a. Set up inbox and typing listeners once socket is connected
  useEffect(() => {
    if (!socketConnected) return;

    webSocketService.subscribeToInboxUpdates((update) => {
      console.log("Inbox update received:", update);
      loadConversations();
    });

    webSocketService.subscribeToTyping((typingEvent) => {
      if (
        selectedConversation &&
        typingEvent.conversationId === selectedConversation.conversationId
      ) {
        setOtherUserTyping(typingEvent.isTyping);
      }
    });
  }, [socketConnected, selectedConversation]);

  // 3b. Set up online-status listener once (STOMP subscription created once,
  //     callback ref is always kept fresh via the callbacks map in the service).
  useEffect(() => {
    if (!socketConnected) return;

    webSocketService.subscribeToOnlineStatus((statusEvent) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.otherParticipant.id === statusEvent.userId) {
            return {
              ...c,
              otherParticipant: {
                ...c.otherParticipant,
                isOnline: statusEvent.isOnline,
                // Use the server-provided lastSeen; fall back to now only for online events
                lastSeen: statusEvent.isOnline
                  ? c.otherParticipant.lastSeen
                  : (statusEvent.lastSeen ? new Date(statusEvent.lastSeen) : new Date()),
              },
            };
          }
          return c;
        }),
      );

      // Also update the selected conversation header if it matches
      setSelectedConversation((prev) => {
        if (!prev || prev.otherParticipant.id !== statusEvent.userId) return prev;
        return {
          ...prev,
          otherParticipant: {
            ...prev.otherParticipant,
            isOnline: statusEvent.isOnline,
            lastSeen: statusEvent.isOnline
              ? prev.otherParticipant.lastSeen
              : (statusEvent.lastSeen ? new Date(statusEvent.lastSeen) : new Date()),
          },
        };
      });
    });
  }, [socketConnected]);

  // 4. Load messages when selected conversation changes
  useEffect(() => {
    if (!selectedConversation) return;

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      setOtherUserTyping(false);
      try {
        const res = await webSocketService.getChatsConversationsMessages(
          selectedConversation.conversationId,
          50,
          0,
        );
        if (res.success && res.data) {
          const sorted = [...res.data].sort(
            (a, b) =>
              new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
          );
          setMessages(sorted);
          webSocketService.markAsRead(selectedConversation.conversationId);
          setConversations((prev) =>
            prev.map((c) =>
              c.conversationId === selectedConversation.conversationId ?
                { ...c, unreadMessageCount: 0 }
              : c,
            ),
          );
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        toast.error("Failed to load message history.");
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();

    webSocketService.subscribeToConversation(
      selectedConversation.conversationId,
      (newMsg: any) => {
        const formattedMsg: messageResponse = {
          id: newMsg.id || Math.random().toString(),
          content: newMsg.content || "",
          sender: newMsg.sender,
          messageType: newMsg.messageType as messageType,
          attachmentUrl: newMsg.attachmentUrl || "",
          isRead: newMsg.isRead !== undefined ? newMsg.isRead : false,
          sentAt: newMsg.sentAt ? new Date(newMsg.sentAt) : new Date(),
        };

        setMessages((prev) => {
          if (prev.some((m) => m.id === formattedMsg.id)) return prev;

          // If the message is sent by the current user, replace the matching temporary message
          if (formattedMsg.sender.id === user?.id) {
            const tempIndex = prev.findIndex(
              (m) =>
                m.id.startsWith("temp-") &&
                m.content === formattedMsg.content &&
                m.messageType === formattedMsg.messageType &&
                m.attachmentUrl === formattedMsg.attachmentUrl,
            );

            if (tempIndex !== -1) {
              const updated = [...prev];
              updated[tempIndex] = formattedMsg;
              return updated;
            }
          }

          return [...prev, formattedMsg];
        });

        if (formattedMsg.sender.id !== user?.id) {
          webSocketService.markAsRead(selectedConversation.conversationId);
        }
      },
    );

    webSocketService.subscribeToReadReceipts(
      selectedConversation.conversationId,
      (readerId: string) => {
        // readerId is the person who just read — if it's NOT us, they read our messages
        if (readerId !== user?.id) {
          setMessages((prev) =>
            prev.map((m) =>
              m.sender.id === user?.id ? { ...m, isRead: true } : m
            )
          );
        }
      }
    );

    return () => {
      webSocketService.unsubscribeFromConversation(
        selectedConversation.conversationId,
      );
      webSocketService.unsubscribeFromReadReceipts(
        selectedConversation.conversationId,
      );
    };
  }, [selectedConversation, user?.id]);

  const detectUrl = (text: string): string | null => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    return matches ? matches[0] : null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (!selectedConversation) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      webSocketService.sendTyping(selectedConversation.conversationId, true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      webSocketService.sendTyping(selectedConversation.conversationId, false);
    }, 2000);
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedConversation) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    webSocketService.sendTyping(selectedConversation.conversationId, false);

    const hasUrl = detectUrl(inputText);
    const msgType = hasUrl ? messageType.LINK : messageType.TEXT;

    const payload = {
      content: inputText,
      messageType: msgType,
      attachmentUrl: "",
    };

    webSocketService.sendMessage(selectedConversation.conversationId, payload);

    const tempMsg: messageResponse = {
      id: `temp-${Date.now()}`,
      content: inputText,
      sender: {
        id: user?.id || "",
        firstName: user?.firstName || "",
        email: user?.email || "",
        lastName: user?.lastName || "",
        avatarUrl: user?.avatarUrl || "",
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
      },
      messageType: msgType,
      attachmentUrl: "",
      isRead: false,
      sentAt: new Date(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInputText("");
  };

  const handleUploadImage = async (file: File) => {
    if (!selectedConversation) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please drop an image file.");
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading("Uploading image...");

    try {
      const res = await MediaService.uploadImage(file);
      if (res && res.secure_url) {
        const payload = {
          content: file.name,
          messageType: messageType.IMAGE,
          attachmentUrl: res.secure_url,
        };

        webSocketService.sendMessage(
          selectedConversation.conversationId,
          payload,
        );

        const tempMsg: messageResponse = {
          id: `temp-img-${Date.now()}`,
          content: file.name,
          sender: {
            id: user?.id || "",
            email: user?.email || "",
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            avatarUrl: user?.avatarUrl || "",
            isOnline: true,
            lastSeen: new Date(),
            createdAt: new Date(),
          },
          messageType: messageType.IMAGE,
          attachmentUrl: res.secure_url,
          isRead: false,
          sentAt: new Date(),
        };

        setMessages((prev) => [...prev, tempMsg]);
        toast.success("Image uploaded successfully!", { id: loadingToast });
      }
    } catch (e) {
      toast.error("Error uploading image.", { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (selectedConversation) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!selectedConversation) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadImage(file);
    }
  };

  return (
    <div
      className="flex h-[calc(100vh-9rem)] md:h-[calc(100vh-4.5rem)] overflow-hidden bg-slate-50/30 dark:bg-slate-900/30 relative font-sans"
      onDragOver={handleDragOver}
    >
      {/* Drag & Drop Glassmorphic Overlay */}
      {isDragging && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-4 border-dashed border-blue-500/50 m-4 rounded-3xl transition-all duration-300 animate-pulse"
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="bg-linear-to-tr from-blue-600 to-indigo-600 p-6 rounded-full shadow-2xl text-white mb-4 transform scale-110">
            <ImageIcon className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
            Drop to Upload & Send
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-xs text-center">
            Upload images directly to this chat conversation.
          </p>
        </div>
      )}

      {/* Conversations Sidebar */}
      <ConversationListSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        chatSearchText={chatSearchText}
        setChatSearchText={setChatSearchText}
        isLoadingConversations={isLoadingConversations}
        user={user}
        mobileActiveView={mobileActiveView}
        setMobileActiveView={setMobileActiveView}
      />

      {/* Active Chat Window */}
      <div
        className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 relative overflow-hidden transition-all duration-300 ${
          mobileActiveView === "list" ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedConversation ?
          <>
            <ChatHeader
              selectedConversation={selectedConversation}
              onBack={() => setMobileActiveView("list")}
            />

            {/* Message Search Input Bar */}
            {isSearchingMessages && (
              <div className="bg-white dark:bg-slate-955 border-b border-slate-100 dark:border-slate-900 px-4 py-2.5 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Find text in messages..."
                  value={messageSearchText}
                  onChange={(e) => setMessageSearchText(e.target.value)}
                  className="flex-1 bg-transparent text-sm border-0 focus:outline-hidden outline-hidden text-slate-700 dark:text-slate-200"
                />
                {messageSearchText && (
                  <button
                    onClick={() => setMessageSearchText("")}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 cursor-pointer border-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <MessageList
              messages={messages}
              user={user}
              isLoadingMessages={isLoadingMessages}
              messageSearchText={messageSearchText}
              otherUserTyping={otherUserTyping}
              onImageClick={setLightboxImage}
            />

            <ChatInput
              inputText={inputText}
              onChangeInputText={handleInputChange}
              onSendMessage={handleSendMessage}
              isUploading={isUploading}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
            />
          </>
        : /* Empty Chat Area State */
          <div className="flex-1 flex flex-col items-center justify-center bg-radial from-white to-slate-50/30 dark:from-slate-950 dark:to-slate-900/30 p-8 text-center select-none">
            <div className="relative w-36 h-36 mb-6 animate-pulse">
              <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
              <div className="w-full h-full bg-linear-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/30 rounded-3xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800">
                <MessageSquare className="w-16 h-16 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Your Inbox
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-505 mt-2 max-w-sm leading-relaxed">
              Select a conversation from the sidebar to view active chats, check
              real-time messages, and share property images.
            </p>
            <Link href="/explore" className="mt-6">
              <button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 cursor-pointer">
                Explore Properties
              </button>
            </Link>
          </div>
        }
      </div>
      {/* Lightbox Image Viewer */}
      <Lightbox
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}
