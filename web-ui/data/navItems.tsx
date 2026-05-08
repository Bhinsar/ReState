import {LucideHome, Search} from "lucide-react";

export interface NavItemsInterface {
    label: string;
    to: string;
    icon: React.ReactNode;
}

export const NavItem:NavItemsInterface[] = [
    {
        label: "Home",
        to: "/",
        icon: <LucideHome size={18}/>
    },
    {
        label: "Explore",
        to: "/explore",
        icon: <Search size={18}/>
    }
]