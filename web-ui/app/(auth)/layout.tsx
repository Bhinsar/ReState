import * as React from "react";
import Image from "next/image";
import {AspectRatio} from "@/components/ui/aspect-ratio";
import {Logo} from "@/data/logo";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Left Side: Logo (50%) */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary p-12 min-h-screen">
        <div className="w-full max-w-75">
          <AspectRatio ratio={1 / 1}>
            <Image
              src={Logo.image}
              alt="Company Logo"
              fill
              sizes="(max-width: 768px) 128px, 150px"
              className="object-contain"
              priority
            />
          </AspectRatio>
          <div className={"flex items-center justify-center text-white text-2xl mt-4 font-bold"}>{Logo.name}</div>
          <div className={"flex items-center justify-center text-white text-xl mt-4 font-medium"}>{Logo.slogan}</div>
        </div>
      </div>

      {/* Right Side: Form (50%) */}
      <main className="flex flex-col w-full items-center md:w-1/2 m-auto justify-center p-8">
          <div className={"flex md:hidden justify-center flex-col align-top items-center"}>
              <div className="w-full max-w-25">
                  <AspectRatio ratio={1 / 1}>
                      <Image
                          src={Logo.image}
                          alt="Company Logo"
                          fill
                          className="object-contain" // Use contain so it doesn't crop
                          priority
                      />
                  </AspectRatio>
              </div>
              <div>
                  <div className={"flex items-center justify-center  text-lg mt-2 font-bold"}>{Logo.name}</div>
                  <div className={"flex items-center justify-center text-center text-sm mt-1 font-medium"}>{Logo.slogan}</div>
              </div>
          </div>
        <div className="w-full max-w-sm mt-10">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
