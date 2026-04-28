import React from 'react';
import {Button} from "@/components/ui/button";

interface SubmitButtonProps {
    label: string,
    isDisabled?: boolean,
    style?: string,
    type?: "button" | "submit" | "reset",
    image?: React.ReactNode,
    onClick? : ()=>void;
}

function SubmitButton({label, isDisabled = false, style, type = "button", image, onClick }: SubmitButtonProps) {
    return (
        <Button type={type}
                className={` ${isDisabled ? "bg-gray-300 hover:bg-gray-300/90 text-gray-800" : "bg-brand-secondary hover:bg-brand-secondary/90"}  transition-all rounded-full py-5 cursor-pointer text-lg font-bold mt-8 w-full ${style}`}
                onClick={onClick}
        >
            {image && image}
            {label}
        </Button>
    );
}

export default SubmitButton;