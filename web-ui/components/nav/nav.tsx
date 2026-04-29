import React from 'react';
import Image from "next/image";
import {Logo} from "@/data/logo";
import {NavItem} from "@/data/navItems";
import Link from "next/link";

function Nav() {
    return (
        <div className="flex w-full items-center justify-between py-2 px-5 shadow-sm border-b border-gray-200">
            {/*logo*/}
            <div className={"flex items-center gap-2"}>
                <Image
                    src={Logo.image}
                    alt="Company Logo"
                    width={10}
                    height={10}
                    priority
                    className="h-auto w-auto"
                />
                <span className={"text-gray-500 mt-3"}>{Logo.name}</span>
            </div>
            <div>
                {NavItem.map((items)=>(
                    <Link key={items.to} href={items.to}  className={"flex justify-center gap-1 text-sm"}>
                        {items.icon} {items.label}
                    </Link>
                ))}
            </div>
        </div>
        );
}

export default Nav;