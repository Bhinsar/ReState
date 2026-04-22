import React, { ReactNode, useState } from 'react';
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import {
    Field,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

type SelectOption = {
    label: string;
    value: string;
};

interface FormInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    charLimit?: number;
    style?: string;
    isDisabled?: boolean;
    isPassword?: boolean;
    placeholder?: string;
    length?: number;
    // Select-specific props
    type?: "text" | "select";
    options?: SelectOption[];
}

function FormInput<T extends FieldValues>({
                                              name,
                                              control,
                                              label,
                                              startIcon,
                                              endIcon,
                                              style,
                                              isDisabled = false,
                                              isPassword = false,
                                              placeholder,
                                              length,
                                              type = "text",
                                              options = [],
                                          }: FormInputProps<T>) {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => setShowPassword((prev) => !prev);

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field className="w-full">
                    {label && (
                        <FieldLabel className="text-md font-medium">
                            {label}
                        </FieldLabel>
                    )}

                    {type === "select" ? (
                        // ── Select variant ──────────────────────────────────────
                        <Select
                            disabled={isDisabled}
                            value={field.value}
                            onValueChange={field.onChange}
                        >
                            <SelectTrigger
                                className={cn(
                                    "rounded-full shadow-none border-2 transition-all w-full bg-white h-11 px-4 py-5",
                                    "focus:ring-0 focus:ring-offset-0",
                                    fieldState.invalid
                                        ? "border-red-500 focus:border-red-600"
                                        : "border-gray-300 focus:border-primary",
                                    isDisabled && "opacity-50 cursor-not-allowed",
                                    style
                                )}
                            >
                                <SelectValue placeholder={placeholder || label || name} />
                            </SelectTrigger>
                            <SelectContent>
                                {options.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        // ── Text / Password variant ──────────────────────────────
                        <div className="relative flex flex-col w-full gap-1">
                            <div className="relative flex items-center w-full">
                                {startIcon && (
                                    <div className="absolute left-3 z-10 pointer-events-none text-gray-500 size-4 [&_svg]:size-full">
                                        {startIcon}
                                    </div>
                                )}
                                <Input
                                    {...field}
                                    disabled={isDisabled}
                                    type={isPassword ? (showPassword ? "text" : "password") : "text"}
                                    placeholder={placeholder || label || name}
                                    maxLength={length}
                                    className={cn(
                                        "rounded-full shadow-none border-2 transition-all w-full bg-white h-11",
                                        "focus-visible:ring-0 focus-visible:ring-offset-0",
                                        startIcon ? "pl-10" : "pl-4",
                                        (endIcon || isPassword) ? "pr-12" : "pr-4",
                                        fieldState.invalid
                                            ? "border-red-500 focus:border-red-600 focus-visible:border-red-600"
                                            : "border-gray-300 focus:border-primary focus-visible:border-primary",
                                        isDisabled && "opacity-50 cursor-not-allowed",
                                        style
                                    )}
                                />
                                {endIcon && !isPassword && (
                                    <div className="absolute right-3 z-10 pointer-events-none text-gray-500 size-4 [&_svg]:size-full">
                                        {endIcon}
                                    </div>
                                )}
                                {isPassword && (
                                    <button
                                        type="button"
                                        onClick={togglePassword}
                                        className="absolute right-3.5 z-20 hover:text-black transition-colors text-muted-foreground size-5 [&_svg]:size-full cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                )}
                            </div>

                            {/* Character counter — replaces the broken InputGroupAddon stubs */}
                            {length && (
                                <span className="self-end text-xs tabular-nums text-muted-foreground pr-1">
                                    {(field.value?.length ?? 0)}/{length} characters
                                </span>
                            )}
                        </div>
                    )}

                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}

export default FormInput;