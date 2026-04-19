import type {Metadata} from "next";
import {Geist} from "next/font/google";
import './globals.css'
import { Toaster } from 'sonner';

const geist = Geist({subsets: ['latin'], variable: '--font-sans'});

export const metadata: Metadata = {
    title: {
        default: 'ReState',
        template: '%s | ReState',
    },
    description: 'Find your dream Property',
    icons: {
        icon: '/images/logo.png',
        shortcut: '/images/logo.png',
        apple: '/images/logo.png',
    },
    openGraph: {
        type: 'website',
        siteName: 'ReState',
        images: [{url: '/favicon.png', width: 1200, height: 630}],
    },
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={geist.variable}>
                {children}
                <Toaster position="top-right" richColors />
            </body>
        </html>
    );
}