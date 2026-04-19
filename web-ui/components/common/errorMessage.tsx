import React from 'react';
import { CircleAlert } from "lucide-react";

interface ErrorMessageProps {
    error: string | null;
    isVisible: boolean;
}

function ErrorMessage({ error, isVisible }: ErrorMessageProps) {
    if (!isVisible || !error) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 text-red-500 bg-red-100 my-2 p-2 rounded-lg border-1 border-red-600 font-[600]">
            <CircleAlert size={16} strokeWidth={3} />
            <span>{error}</span>
        </div>
    );
}

export default ErrorMessage;