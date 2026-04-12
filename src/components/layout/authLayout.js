import React from "react";
import Header from "../header";
import Navigation from "../navigation";
import Footer from "../footer";
import Sidebar from "../sidebar";
import { cn } from "@/lib/utils";

export default function AuthLayout({ children, sidebarList }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <Navigation />

      <div className="relative flex flex-grow">
        {sidebarList && sidebarList.length > 0 && (
          <Sidebar
            className={cn(`absolute md:relative overflow-y-auto`)}
            sidebarList={sidebarList}
          />
        )}

        <main id="content" className="flex-1 z-0 overflow-auto px-5 md:px-0">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
