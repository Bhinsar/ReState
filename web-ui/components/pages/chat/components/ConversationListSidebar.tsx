"use client";

import React from "react";
import Image from "next/image";
import { Search, Sparkles, MessageSquare, Loader2 } from "lucide-react";
import { CoversationResponse } from "@/services/webSocket/webSocket.Interface";
import { authResponse } from "@/services/auth/auth.Interface";
import { Input } from "@/components/ui/input";

interface ConversationListSidebarProps {
  conversations: CoversationResponse[];
  selectedConversation: CoversationResponse | null;
  onSelectConversation: (chat: CoversationResponse) => void;
  chatSearchText: string;
  setChatSearchText: (text: string) => void;
  isLoadingConversations: boolean;
  user: authResponse | null;
  mobileActiveView: "list" | "chat";
  setMobileActiveView: (view: "list" | "chat") => void;
}

export default function ConversationListSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  chatSearchText,
  setChatSearchText,
  isLoadingConversations,
  user,
  mobileActiveView,
  setMobileActiveView
}: ConversationListSidebarProps) {
  
  // Format Time
  const formatTime = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const name = `${c.otherParticipant.firstName} ${c.otherParticipant.lastName}`.toLowerCase();
    return name.includes(chatSearchText.toLowerCase());
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadMessageCount, 0);

  return (
    <div className={`w-full md:w-80 lg:w-96 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shrink-0 transition-transform duration-300 z-20 ${
      mobileActiveView === "chat" ? "hidden md:flex" : "flex"
    }`}>
      {/* Sidebar Header */}
      <div className="p-4 pb-2 border-b border-slate-50 dark:border-slate-900">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            Messages
            {totalUnread > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                {totalUnread} New
              </span>
            )}
          </h1>
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-900 flex items-center justify-center text-blue-600">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        
        {/* Search bar */}
        <div className="relative mb-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={chatSearchText}
            onChange={(e) => setChatSearchText(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-900 dark:hover:bg-slate-900/70 dark:focus:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl py-2.5 pl-10 pr-4 text-sm font-medium transition-all duration-200 outline-hidden"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-900/50 custom-scrollbar p-2 space-y-1">
        {isLoadingConversations ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-xs text-slate-400 mt-2 font-medium">Loading conversations...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-550 dark:bg-slate-900 flex items-center justify-center text-slate-400">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">No chats found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-50 mx-auto">
              Explore properties and click "I'm Interested" or contact agents to start a chat.
            </p>
          </div>
        ) : (
          filteredConversations.map((chat) => {
            const isActive = selectedConversation?.conversationId === chat.conversationId;
            const hasUnread = chat.unreadMessageCount > 0;
            const participant = chat.otherParticipant;
            
            return (
              <button
                key={chat.conversationId}
                onClick={() => {
                  onSelectConversation(chat);
                  setMobileActiveView("chat");
                }}
                className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left transition-all duration-205 cursor-pointer border-none ${
                  isActive 
                    ? "bg-blue-50/80 dark:bg-blue-950/20 border-l-4 border-blue-600 shadow-xs" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-900/50 border-l-4 border-transparent"
                }`}
              >
                {/* User Avatar with Online Dot */}
                <div className="relative shrink-0">
                  {participant.avatarUrl ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden relative border border-slate-100 dark:border-slate-800">
                      <Image
                        src={participant.avatarUrl}
                        alt={`${participant.firstName}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {participant.firstName[0]}{participant.lastName[0]}
                    </div>
                  )}
                  {participant.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 animate-pulse" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={`text-sm truncate font-semibold ${
                      hasUnread ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-200"
                    }`}>
                      {participant.firstName} {participant.lastName}
                    </h4>
                    {chat.lastMessageTime && (
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate ${
                    hasUnread 
                      ? "text-slate-900 dark:text-slate-100 font-bold" 
                      : "text-slate-400 dark:text-slate-505 font-medium"
                  }`}>
                    {chat.lastMessageContent || "No messages yet"}
                  </p>
                </div>

                {/* Badges */}
                {hasUnread && (
                  <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-md shadow-blue-200 dark:shadow-none animate-bounce">
                    {chat.unreadMessageCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Logged in User Bar */}
      <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-50 dark:border-slate-900 flex items-center gap-3">
        {user?.avatarUrl ? (
          <div className="w-9 h-9 rounded-full overflow-hidden relative">
            <Image src={user.avatarUrl} alt="My profile" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
        </div>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Connected" />
      </div>
    </div>
  );
}
