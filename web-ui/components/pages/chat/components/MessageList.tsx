"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  MessageSquare,
  Clock,
  Maximize2,
  Link2,
  FileText,
  ExternalLink,
  CheckCheck,
  Check,
} from "lucide-react";
import {
  messageResponse,
  messageType,
  CoversationResponse,
} from "@/services/webSocket/webSocket.Interface";
import { authResponse } from "@/services/auth/auth.Interface";
// @ts-ignore
import Microlink from "@microlink/react";
import Loading from "@/components/common/loading";

interface MessageListProps {
  messages: messageResponse[];
  user: authResponse | null;
  isLoadingMessages: boolean;
  messageSearchText: string;
  otherUserTyping: boolean;
  onImageClick: (url: string) => void;
}

export default function MessageList({
  messages,
  user,
  isLoadingMessages,
  messageSearchText,
  otherUserTyping,
  onImageClick,
}: MessageListProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, otherUserTyping]);
  // Helper to extract URLs
  const detectUrl = (text: string): string | null => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    return matches ? matches[0] : null;
  };

  // Format Dates
  const formatTime = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateLabel = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  // Filter messages based on search query inside the conversation
  const filteredMessages = messages.filter((m) => {
    if (!messageSearchText) return true;
    return m.content?.toLowerCase().includes(messageSearchText.toLowerCase());
  });

  if (isLoadingMessages) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <Loading />
      </div>
    );
  }

  if (filteredMessages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 mb-3">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-700 dark:text-slate-300">
          {messageSearchText ? "No matches found" : "Say Hello!"}
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-60">
          {messageSearchText ?
            "Try searching for a different word or clear the search filter."
          : "Start a conversation. Type a message or drop an image below!"}
        </p>
      </div>
    );
  }

  let lastDateLabel = "";

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
      {filteredMessages.map((msg, index) => {
        const isSelf = msg.sender.id === user?.id;
        const msgDateLabel = formatDateLabel(msg.sentAt);
        const showDateLabel = msgDateLabel !== lastDateLabel;
        lastDateLabel = msgDateLabel;

        // Group bubbles if sent by same sender consecutively within 3 minutes
        const prevMsg = index > 0 ? filteredMessages[index - 1] : null;
        const isConsecutive =
          prevMsg &&
          prevMsg.sender.id === msg.sender.id &&
          new Date(msg.sentAt).getTime() - new Date(prevMsg.sentAt).getTime() <
            3 * 60 * 1000 &&
          formatDateLabel(prevMsg.sentAt) === msgDateLabel;

        const hasUrl =
          msg.messageType === messageType.LINK ||
          (msg.content && detectUrl(msg.content));
        const extractedUrl = msg.content ? detectUrl(msg.content) : null;

        return (
          <div key={msg.id} className="space-y-1">
            {showDateLabel && (
              <div className="flex justify-center my-4">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full">
                  {msgDateLabel}
                </span>
              </div>
            )}

            <div
              className={`flex ${isSelf ? "justify-end" : "justify-start"} items-end gap-2`}
            >
              {/* Profile image for other user */}
              {/* {!isSelf && !isConsecutive && (
                <div className="relative shrink-0 mb-1">
                  {msg.sender.avatarUrl ?
                    <div className="w-8 h-8 rounded-full overflow-hidden relative">
                      <Image
                        src={msg.sender.avatarUrl}
                        alt="sender avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                  : <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-505 font-bold text-xs">
                      {msg.sender.firstName[0]}
                      {msg.sender.lastName[0]}
                    </div>
                  }
                </div>
              )} */}
              {/* {!isSelf && isConsecutive && <div className="w-8" />} */}

              <div
                className={`flex flex-col max-w-[75%] lg:max-w-[65%] ${isSelf ? "items-end" : "items-start"}`}
              >
                {/* Sender name for other if not consecutive */}
                {/* {!isSelf && !isConsecutive && (
                  <span className="text-[10px] font-bold text-slate-400 mb-0.5 ml-1">
                    {msg.sender.firstName}
                  </span>
                )} */}

                {/* Bubble content */}
                <div
                  className={`relative px-4 py-2.5 rounded-2xl shadow-xs transition-all duration-200 ${
                    isSelf ?
                      "bg-linear-to-tr from-blue-600 to-indigo-600 text-white rounded-br-none"
                    : "bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-900"
                  } ${
                    isConsecutive ?
                      isSelf ? "rounded-tr-2xl"
                      : "rounded-tl-2xl"
                    : ""
                  }`}
                >
                  {/* 1. Rendering Images */}
                  {msg.messageType === messageType.IMAGE &&
                    msg.attachmentUrl && (
                      <div className="space-y-2 select-none group/img relative">
                        <div
                          className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-xl overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-900 border border-slate-200/50"
                          onClick={() => onImageClick(msg.attachmentUrl || "")}
                        >
                          <Image
                            src={msg.attachmentUrl}
                            alt={msg.content || "Attached image"}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                            sizes="(max-width: 640px) 192px, 256px"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/25 flex items-center justify-center transition-colors duration-200">
                            <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-200" />
                          </div>
                        </div>
                        {msg.content && (
                          <p className="text-xs font-medium break-all">
                            {msg.content}
                          </p>
                        )}
                      </div>
                    )}

                  {/* 2. Rendering Text */}
                  {msg.messageType !== messageType.IMAGE && msg.content && (
                    <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed wrap-break-word">
                      {msg.content}
                    </p>
                  )}

                  {/* 3. Rendering Link Previews & Attachments */}
                  {msg.attachmentUrl &&
                    msg.messageType !== messageType.IMAGE && (
                      <div className="mt-2 flex flex-col gap-2">
                        {msg.attachmentUrl.includes("/properties/") ?
                          <Link
                            href={msg.attachmentUrl.substring(
                              msg.attachmentUrl.indexOf("/properties/"),
                            )}
                            className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100/50 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200 group/link text-blue-600 dark:text-blue-400"
                          >
                            <div className="p-2 bg-blue-500 text-white rounded-lg group-hover/link:scale-105 transition-transform duration-200 shadow-xs shrink-0">
                              <Link2 className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider block">
                                Property Link
                              </span>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate block mt-0.5">
                                View Property Details
                              </span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                          </Link>
                        : <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all duration-200 group/link text-slate-600 dark:text-slate-300"
                          >
                            <div className="p-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg group-hover/link:scale-105 transition-transform duration-200 shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-semibold uppercase tracking-wider block text-slate-400">
                                File Attachment
                              </span>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate block mt-0.5">
                                Download Attachment
                              </span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                          </a>
                        }
                      </div>
                    )}

                  {/* 4. Rendering Link Previews (using Microlink as fallback for other URLs) */}
                  {hasUrl && extractedUrl && !msg.attachmentUrl && (
                    <div className="mt-2.5 max-w-70 sm:max-w-md overflow-hidden bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/80 transition-shadow hover:shadow-xs">
                      <Microlink
                        url={extractedUrl}
                        size="normal"
                        style={{
                          width: "100%",
                          border: "none",
                          borderRadius: "12px",
                          background: "transparent",
                        }}
                      />
                    </div>
                  )}
                  {/* Message status indicator — only shown for own messages */}
                  <div className="flex justify-end items-center gap-1 mt-1">
                    <span className="text-[9px] text-slate-400 font-semibold px-1">
                      {formatTime(msg.sentAt)}
                    </span>
                    {isSelf && (
                      <span className="px-1">
                        {msg.id.startsWith("temp-") ? (
                          /* Pending: message not yet confirmed by server */
                          <Clock
                            size={11}
                            className="text-slate-400/70"
                            aria-label="Sending"
                          />
                        ) : msg.isRead ? (
                          /* Read: other user has opened the conversation */
                          <CheckCheck
                            size={12}
                            className="text-blue-400"
                            aria-label="Read"
                          />
                        ) : (
                          /* Delivered: confirmed by server, not yet read */
                          <CheckCheck
                            size={12}
                            className="text-slate-400/80"
                            aria-label="Delivered"
                          />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator bubble */}
      {otherUserTyping && (
        <div className="flex justify-start items-center gap-2 animate-pulse mb-2">
          <div className="bg-white dark:bg-slate-950 px-4 py-2.5 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-900 flex items-center gap-1.5 shadow-xs">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
}
