"use client";

import React from "react";
import { Loader2, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  inputText: string;
  onChangeInputText: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSendMessage: (e?: React.FormEvent) => void;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ChatInput({
  inputText,
  onChangeInputText,
  onSendMessage,
  isUploading,
  fileInputRef,
  onFileChange
}: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage();
  };

  return (
    <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80 z-10">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-7xl mx-auto">
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          ref={fileInputRef}
          className="hidden"
          disabled={isUploading}
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all cursor-pointer flex shrink-0 border-0"
          title="Attach image"
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Paperclip className="w-5 h-5" />
          )}
        </button>

        <textarea
          rows={1}
          value={inputText}
          onChange={onChangeInputText}
          placeholder="Write a message..."
          className="flex-1 bg-slate-50 hover:bg-slate-100/60 focus:bg-white dark:bg-slate-900 dark:hover:bg-slate-900/60 dark:focus:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 outline-hidden resize-none max-h-24 min-h-11 custom-scrollbar text-slate-700 dark:text-slate-100"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />

        <Button
          type="submit"
          disabled={!inputText.trim()}
          size="sm"
          className={`h-11 w-11 p-0 rounded-2xl text-white shadow-lg active:scale-95 transition-all duration-200 flex shrink-0 cursor-pointer justify-center items-center ${
            inputText.trim() 
              ? "bg-linear-to-r from-blue-600 to-indigo-600 shadow-blue-100 hover:shadow-blue-200 dark:shadow-none hover:opacity-90" 
              : "bg-slate-200 dark:bg-slate-800 text-slate-400 shadow-none cursor-not-allowed"
          }`}
          title="Send message"
        >
          <Send className="w-4.5 h-4.5" />
        </Button>
      </form>
    </div>
  );
}
