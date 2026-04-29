import {LucideHome} from "lucide-react";

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
    }
]