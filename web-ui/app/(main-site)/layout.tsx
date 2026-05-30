"use client";

import React from 'react';
import Nav from "@/components/common/nav";
import Footer from "@/components/common/footer";
import { usePathname } from "next/navigation";

function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isChatPage = pathname === "/chat";

    return (
        <div className="pb-20 md:pb-0">
            <Nav/>
            {children}
            {!isChatPage && <Footer />}
        </div>
    );
}

export default Layout;