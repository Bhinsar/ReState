"use client";

import React from "react";
import Image from "next/image";
import { X, ExternalLink } from "lucide-react";

interface LightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function Lightbox({ imageUrl, onClose }: LightboxProps) {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </button>
      
      <div className="relative max-w-5xl max-h-[85vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
        <Image
          src={imageUrl}
          alt="Expanded Preview"
          fill
          className="object-contain rounded-lg"
          unoptimized
        />
      </div>
      
      <div className="mt-4 flex gap-4">
        <a 
          href={imageUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open Original
        </a>
      </div>
    </div>
  );
}
