
"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogOut, Settings, LayoutDashboard, MapIcon, Users, Siren, CarTaxiFront } from 'lucide-react'; // Changed AlertOctagon to Siren, Added CarTaxiFront
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation"; // Import usePathname

// TriGo Logo SVG
const TriGoLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
    <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9.5 20V14C9.5 12.8954 10.3954 12 11.5 12H17.5C18.6046 12 19.5 12.8954 19.5 14V20" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    {/* Roof part of the cabin, connected to the top line of the cabin */}
    <path d="M9.5 14C9.5 11.5 12.3125 9.5 16 9.5C19.6875 9.5 22.5 11.5 22.5 14H19.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
     {/* Simpler roof */}
    <path d="M M9.5 12 Q16 8 22.5 12 L19.5 12" stroke="currentColor" strokeWidth="1.2" fill="none" />

    <path d="M19.5 13H21.5C22.0523 13 22.5 13.4477 22.5 14V17C22.5 17.5523 22.0523 18 21.5 18H19.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <circle cx="12" cy="20.5" r="1.5" stroke="currentColor" strokeWidth="1" fill="none"/>
    <circle cx="17" cy="20.5" r="1.5" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
);

// TriGo Alert Logo (Placeholder - replace with actual SVG or Image component if provided)
const TriGoAlertLogo = () => (
  <Siren className="text-destructive" /> // Using Siren as placeholder, user might provide specific SVG
);


export default function DispatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Get current path

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <TriGoLogo />
            <h1 className="text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">TriGo Dispatch</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/"}>
                <Link href="/">
                  <LayoutDashboard />
                  <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/triders"}>
                <Link href="/triders">
                  <CarTaxiFront /> {/* Users icon was here, changed to CarTaxiFront for "Triders" */}
                  <span className="group-data-[collapsible=icon]:hidden">Triders</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/live-map"}>
                <Link href="#"> {/* Update href when live map page exists */}
                  <MapIcon />
                  <span className="group-data-[collapsible=icon]:hidden">Live Map</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/alerts"}>
                <Link href="#"> {/* Update href when alerts page exists */}
                  <TriGoAlertLogo /> {/* Using the new TriGoAlertLogo */}
                   <span className="group-data-[collapsible=icon]:hidden">Alerts</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
           <Separator className="my-2 group-data-[collapsible=icon]:hidden" />
           <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/settings"}>
                <Link href="#">  {/* Update href when settings page exists */}
                  <Settings />
                  <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="#"> {/* Update href for logout functionality */}
                  <LogOut />
                  <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
         <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2 md:hidden">
          <SidebarTrigger />
           <div className="flex items-center gap-2">
            <TriGoLogo />
            <h1 className="text-lg font-semibold text-primary">TriGo Dispatch</h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-background"> {/* Added bg-background for consistency */}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
