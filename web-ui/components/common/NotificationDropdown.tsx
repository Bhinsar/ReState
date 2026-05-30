'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck, Loader2, Building, Inbox } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getNotificationStyle } from './NotificationToast';

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    unreadCount,
    isLoading,
    readNotification,
    readAllNotifications,
  } = useNotifications(isOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    if(isOpen){

      function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleNotificationClick = async (id: string, propertyId?: string, conversationId?: string) => {
    // Mark as read
    readNotification(id);
    
    // Close dropdown
    setIsOpen(false);
    
    // Navigate if there's a property association
    if (conversationId) {
      router.push(`/chat?conversationId=${conversationId}`);
    } else if (propertyId) {
      router.push(`/properties/${propertyId}`);
    }
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    readAllNotifications();
  };

  // Simple date formatter
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-hidden group cursor-pointer border border-transparent hover:border-gray-200",
          isOpen && "bg-gray-100 border-gray-200 text-blue-600"
        )}
        aria-label="View notifications"
      >
        <Bell className={cn(
          "w-5 h-5 text-gray-600 transition-transform group-hover:scale-105 duration-200",
          isOpen && "text-blue-600"
        )} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
              <p className="text-xs text-gray-500">
                {unreadCount > 0 ? `${unreadCount} unread` : 'No unread notifications'}
              </p>
            </div>
            {unreadCount > 0 && notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
            {isLoading ? (
              // Shimmer Loading States
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2 py-0.5">
                      <div className="h-3.5 bg-gray-200 rounded-sm w-3/4" />
                      <div className="h-3 bg-gray-200 rounded-sm w-5/6" />
                      <div className="h-2.5 bg-gray-100 rounded-sm w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              // Empty State
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <Inbox className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                  You have no notifications at the moment.
                </p>
              </div>
            ) : (
              // Notifications list
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.propertyId)}
                  className={cn(
                    "p-4 flex gap-3 hover:bg-gray-50/80 transition-all duration-200 cursor-pointer relative group",
                    !notification.isRead && "bg-blue-50/30 hover:bg-blue-50/50"
                  )}
                >
                  {/* Status Indicator Dot */}
                  {!notification.isRead && (
                    <span className="absolute top-4 left-2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  )}

                  {/* Icon depending on type */}
                  {(() => {
                    const style = getNotificationStyle(notification.type);
                    const IconComponent = style.icon;
                    return (
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-xs",
                        notification.isRead 
                          ? "bg-gray-100 text-gray-400" 
                          : style.bgClass.split(' ')[0] + " " + style.iconClass
                      )}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                    );
                  })()}

                  {/* Content details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className={cn(
                        "text-xs font-semibold text-gray-900 leading-snug break-words",
                        !notification.isRead && "font-bold"
                      )}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-normal break-words line-clamp-2">
                      {notification.body}
                    </p>

                    {/* Associated Property tag */}
                    {notification.propertyTitle && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 w-fit px-2 py-0.5 rounded-md transition-colors">
                        <Building className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[150px]">{notification.propertyTitle}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
