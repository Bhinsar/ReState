import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ArrowLeft } from "lucide-react"; // Standard, stable icon library
import { cn } from "@/lib/utils"; // Standard Shadcn utility for merging classes

interface BackButtonProps {
    className?: string; // Renamed from style to match standard HTML/React naming
    onClick?: () => void;
}

function BackButton({ className, onClick }: BackButtonProps) {
    return (
        <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            className={cn(
                "rounded-full bg-white text-gray-500 absolute top-4 left-3 cursor-pointer",
                className
            )}
        >
            <ArrowLeft className="h-5 w-5" />
        </Button>
    );
}

export default BackButton;