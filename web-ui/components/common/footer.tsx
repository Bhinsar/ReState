import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/data/logo';
import {Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-800 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 group w-fit">
                            <div className="relative w-8 h-8 transition-transform group-hover:scale-110 duration-300 bg-white rounded-lg p-1">
                                <Image
                                    src={Logo.image}
                                    alt="ReState Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-br from-brand-primary to-brand-secondary tracking-tight">
                                {Logo.name}
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            {Logo.slogan} Experience the simplest and most elegant way to find your perfect space with our premium platform.
                        </p>
                        {/* <div className="flex items-center gap-4">
                            {[
                                { icon: FaceB, href: '#' },
                                { icon: Twitter, href: '#' },
                                { icon: Instagram, href: '#' },
                                { icon: Linkedin, href: '#' },
                            ].map((social, idx) => (
                                <Link 
                                    key={idx} 
                                    href={social.href}
                                    className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/10 transition-all duration-300 hover:-translate-y-1 shadow-lg"
                                >
                                    <social.icon className="w-4 h-4" />
                                </Link>
                            ))}
                        </div> */}
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-white font-semibold text-lg tracking-wide">Quick Links</h3>
                        <ul className="space-y-3">
                            {[
                                { label: 'Home', href: '/' },
                                { label: 'Properties', href: '/properties' },
                                { label: 'About Us', href: '/about' },
                                { label: 'Contact', href: '/contact' },
                                { label: 'Blog', href: '/blog' },
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <Link 
                                        href={link.href}
                                        className="text-sm text-slate-400 hover:text-brand-primary transition-colors duration-200 flex items-center gap-2 group"
                                    >
                                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                        <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Property Types */}
                    <div className="space-y-6">
                        <h3 className="text-white font-semibold text-lg tracking-wide">Property Types</h3>
                        <ul className="space-y-3">
                            {[
                                { label: 'Luxury Villas', href: '/properties?type=villa' },
                                { label: 'Modern Apartments', href: '/properties?type=apartment' },
                                { label: 'Commercial Spaces', href: '/properties?type=commercial' },
                                { label: 'Cozy Cottages', href: '/properties?type=cottage' },
                                { label: 'Penthouse Suites', href: '/properties?type=penthouse' },
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <Link 
                                        href={link.href}
                                        className="text-sm text-slate-400 hover:text-brand-primary transition-colors duration-200 flex items-center gap-2 group"
                                    >
                                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                        <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h3 className="text-white font-semibold text-lg tracking-wide">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-slate-400 group">
                                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-brand-primary group-hover:bg-brand-primary/10 transition-colors mt-0.5">
                                    <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
                                </div>
                                <span className="pt-1">123 Real Estate Blvd,<br/>Suite 100, New York, NY 10001</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-400 group">
                                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-brand-primary group-hover:bg-brand-primary/10 transition-colors">
                                    <Phone className="w-4 h-4 text-brand-primary shrink-0" />
                                </div>
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-400 group">
                                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-brand-primary group-hover:bg-brand-primary/10 transition-colors">
                                    <Mail className="w-4 h-4 text-brand-primary shrink-0" />
                                </div>
                                <span>support@restate.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 mb-16 md:mb-0">
                    <p className="text-sm text-slate-500 text-center md:text-left">
                        &copy; {new Date().getFullYear()} {Logo.name}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                        <Link href="/privacy" className="hover:text-brand-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-brand-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
