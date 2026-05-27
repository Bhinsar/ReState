import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Building, 
  MessageSquare, 
  ArrowUpDown, 
  CheckCircle2, 
  XCircle, 
  BadgeCheck, 
  Info, 
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const getNotificationStyle = (type?: string) => {
  switch (type) {
    case 'PROPERTY_INTEREST':
      return {
        icon: Building,
        iconClass: 'text-indigo-600',
        bgClass: 'bg-indigo-50/70 ring-indigo-50/30',
        borderColor: 'from-transparent via-indigo-600 to-transparent',
      };
    case 'NEW_MESSAGE':
      return {
        icon: MessageSquare,
        iconClass: 'text-blue-600',
        bgClass: 'bg-blue-50/70 ring-blue-50/30',
        borderColor: 'from-transparent via-blue-600 to-transparent',
      };
    case 'TRADE_REQUEST':
      return {
        icon: ArrowUpDown,
        iconClass: 'text-amber-600',
        bgClass: 'bg-amber-50/70 ring-amber-50/30',
        borderColor: 'from-transparent via-amber-600 to-transparent',
      };
    case 'TRADE_ACCEPTED':
      return {
        icon: CheckCircle2,
        iconClass: 'text-emerald-600',
        bgClass: 'bg-emerald-50/70 ring-emerald-50/30',
        borderColor: 'from-transparent via-emerald-600 to-transparent',
      };
    case 'TRADE_REJECTED':
      return {
        icon: XCircle,
        iconClass: 'text-rose-600',
        bgClass: 'bg-rose-50/70 ring-rose-50/30',
        borderColor: 'from-transparent via-rose-600 to-transparent',
      };
    case 'PROPERTY_APPROVED':
      return {
        icon: BadgeCheck,
        iconClass: 'text-teal-600',
        bgClass: 'bg-teal-50/70 ring-teal-50/30',
        borderColor: 'from-transparent via-teal-600 to-transparent',
      };
    case 'SYSTEM':
      return {
        icon: Info,
        iconClass: 'text-slate-600',
        bgClass: 'bg-slate-50/70 ring-slate-50/30',
        borderColor: 'from-transparent via-slate-600 to-transparent',
      };
    default:
      return {
        icon: Bell,
        iconClass: 'text-blue-600',
        bgClass: 'bg-blue-50/70 ring-blue-50/30',
        borderColor: 'from-transparent via-blue-600 to-transparent',
      };
  }
};

interface NotificationToastProps {
  title: string;
  body: string;
  type?: string;
  propertyId?: string;
  onClose: () => void;
}

export default function NotificationToast({ title, body, type, propertyId, onClose }: NotificationToastProps) {
  const router = useRouter();

  const handleView = () => {
    if (propertyId) {
      router.push(`/properties/${propertyId}`);
    }
    onClose();
  };

  const style = getNotificationStyle(type);
  const IconComponent = style.icon;

  return (
    <div
      className={cn(
        "relative flex w-full max-w-sm sm:max-w-md items-center gap-4 rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl sm:p-5",
        "animate-in fade-in slide-in-from-top-4 duration-300"
      )}
    >
      {/* Decorative gradient border effect */}
      <div className={cn(
        "absolute inset-x-0 -top-px h-[2px] bg-linear-to-r opacity-80",
        style.borderColor
      )} />
      
      {/* Left Icon with modern background */}
      <div className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs ring-4",
        style.bgClass,
        style.iconClass
      )}>
        <IconComponent className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug tracking-tight">
          {title}
        </h4>
        <p className="mt-1 text-[11px] sm:text-xs text-gray-500 leading-relaxed font-medium line-clamp-2">
          {body}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {propertyId && (
          <button
            onClick={handleView}
            className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95"
          >
            View
          </button>
        )}
        <button
          onClick={onClose}
          className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
