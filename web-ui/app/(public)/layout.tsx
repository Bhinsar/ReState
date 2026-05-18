import React from 'react';
import Nav from "@/components/nav/nav";
import Footer from "@/components/common/footer";

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="pb-20 md:pb-0">
            <Nav/>
            {children}
            <Footer />
        </div>
    );
}

export default Layout;