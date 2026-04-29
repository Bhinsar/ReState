import React from 'react';
import Nav from "@/components/nav/nav";

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Nav/>
            {children}
        </div>
    );
}

export default Layout;