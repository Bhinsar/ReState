"use client";

import React from "react";
import Image from "next/image";
import { ArrowLeft, Clock } from "lucide-react";
import { CoversationResponse } from "@/services/webSocket/webSocket.Interface";
import { toast } from "sonner";

interface ChatHeaderProps {
  selectedConversation: CoversationResponse;
  onBack: () => void;
}

export default function ChatHeader({
  selectedConversation,
  onBack,
}: ChatHeaderProps) {
  const participant = selectedConversation.otherParticipant;

  const formatLastSeen = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (d.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${timeStr}`;
      } else {
        const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
        return `${dateStr} at ${timeStr}`;
      }
    }
  };

  return (
    <div className="h-16 px-4 bg-white dark:bg-slate-955 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-xs z-10">
      <div className="flex items-center gap-3 min-w-0">
        {/* Back button on mobile */}
        <button
          onClick={onBack}
          className="md:hidden p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="relative shrink-0">
          {participant.avatarUrl ?
            <div className="w-10 h-10 rounded-full overflow-hidden relative">
              <Image
                src={participant.avatarUrl}
                alt="Participant"
                fill
                className="object-cover"
              />
            </div>
          : <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {participant.firstName[0]}
              {participant.lastName[0]}
            </div>
          }
        </div>

        {/* Participant Details */}
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate">
            {participant.firstName} {participant.lastName}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              {participant.isOnline ?
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Online
                </>
              : <>
                  <Clock className="w-3 h-3 inline" />
                  {formatLastSeen(participant.lastSeen)}
                </>
              }
            </p>
            
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1.5">
        {/* <button 
          onClick={() => setIsSearchingMessages(!isSearchingMessages)}
          className={`p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer ${
            isSearchingMessages ? "text-blue-600 bg-blue-50 dark:bg-blue-950/20" : ""
          }`}
          title="Search messages"
        >
          <Search className="w-4 h-4" />
        </button>
        <button 
          className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          title="Audio call"
        >
          <Phone className="w-4 h-4" />
        </button>
        <button 
          className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          title="Video call"
        >
          <Video className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-slate-100 dark:bg-slate-800 mx-1" /> */}
        {/* <button 
          onClick={() => setShowInfoSidebar(!showInfoSidebar)}
          className={`p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer ${
            showInfoSidebar ? "text-blue-600 bg-blue-50 dark:bg-blue-950/20" : ""
          }`}
          title="Conversation info"
        >
          <Info className="w-4 h-4" />
        </button> */}
      </div>
    </div>
  );
}
