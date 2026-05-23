'use client'
import React, { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import { Logo } from "@/data/logo";
import { NavItem } from "@/data/navItems";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { CircleUser, LogIn, LogOut, User, Settings, ChevronDown, List } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { AuthService } from '@/services/auth/auth.Service';

function Nav() {
    const pathname = usePathname();
    const { isAuthenticated, user, clearUser } = useAuthStore();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await AuthService.logout();
    };

    return (
        <>
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-8 h-8 transition-transform group-hover:scale-110 duration-300">
                            <Image
                                src={Logo.image}
                                alt="ReState Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 tracking-tight">
                            {Logo.name}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-1">

                        {NavItem.map((item) => {
                            const isActive = pathname === item.to;
                            return (
                                <Link
                                    key={item.to}
                                    href={item.to}
                                    className={cn(
                                        "relative px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-1.5 rounded-full",
                                        isActive 
                                            ? "text-blue-600 bg-blue-50" 
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    )}
                                >
                                    {item.icon}
                                    {item.label}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full mb-1" />
                                    )}
                                </Link>
                            );
                        })}
                        </div>

                        {!isAuthenticated ? (
                            <div className="ml-4 flex items-center gap-3">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="items-center gap-2 text-gray-600 hover:text-blue-600">
                                        <LogIn className="w-4 h-4" />
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/sign-up">
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all duration-300 active:scale-95">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="ml-4 relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex cursor-pointer items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-200 group"
                                >
                                    {user?.avatarUrl ? (
                                        <Image src={user?.avatarUrl} alt="Profile" width={32} height={32} className="rounded-full" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md group-hover:shadow-lg transition-shadow">
                                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                                        </div>
                                    )}
                                    <div className="hidden lg:block text-left">
                                        <p className="text-sm font-semibold text-gray-700 leading-tight">
                                            {user?.firstName}
                                        </p>
                                    </div>
                                    <ChevronDown className={cn(
                                        "w-4 h-4 text-gray-400 transition-transform duration-200",
                                        isDropdownOpen && "rotate-180 text-blue-600"
                                    )} />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 z-50">
                                        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                            <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>
                                        
                                        <div className="p-2">
                                            <Link 
                                                href="/profile" 
                                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <User className="w-4 h-4 transition-transform group-hover:scale-110" />
                                                My Profile
                                            </Link>
                                            {/* <Link 
                                                href="/settings" 
                                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <Settings className="w-4 h-4 transition-transform group-hover:scale-110" />
                                                Settings
                                            </Link> */}
                                            <Link 
                                                href="/my-properties" 
                                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <List className="w-4 h-4 transition-transform group-hover:scale-110" />
                                                My Properties
                                            </Link>
                                        </div>

                                        <div className="p-2 border-t border-gray-50">
                                            <button
                                                onClick={handleLogout}
                                                className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                                            >
                                                <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </nav>
        {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-6 py-3 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex justify-around items-center max-w-md mx-auto">
                    {NavItem.map((item) => {
                        const isActive = pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                href={item.to}
                                className={cn(
                                    "flex flex-col items-center gap-1 transition-all duration-300 relative",
                                    isActive ? "text-blue-600" : "text-gray-400"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-xl transition-all duration-300",
                                    isActive ? "bg-blue-50 scale-110" : "hover:bg-gray-50"
                                )}>
                                    {item.icon}
                                </div>
                                <span className="text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
                                {isActive && (
                                    <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
            
        </>
    );
}

export default Nav;
