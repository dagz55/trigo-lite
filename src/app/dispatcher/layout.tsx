
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
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  LayoutDashboard, 
  Landmark, 
  Users, 
  Siren, 
  CarTaxiFront, 
  LogIn, 
  UserPlus,
  MessagesSquare,
  Wallet,
  MoreHorizontal,
  UserCircle,
  CreditCard,
  HelpCircle as HelpCircleIcon, // Renamed to avoid conflict with a potential local variable
  LogOut as LogOutIcon
} from 'lucide-react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SheetTitle } from "@/components/ui/sheet"; 
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import * as React from 'react';

// TriGo Logo SVG
const TriGoLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
    <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9.5 20V14C9.5 12.8954 10.3954 12 11.5 12H17.5C18.6046 12 19.5 12.8954 19.5 14V20" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <path d="M M9.5 12 Q16 8 22.5 12 L19.5 12" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <path d="M19.5 13H21.5C22.0523 13 22.5 13.4477 22.5 14V17C22.5 17.5523 22.0523 18 21.5 18H19.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <circle cx="12" cy="20.5" r="1.5" stroke="currentColor" strokeWidth="1" fill="none"/>
    <circle cx="17" cy="20.5" r="1.5" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
);

const TriGoAlertLogo = () => (
  <Siren className="text-destructive" />
);

// VisuallyHidden component for accessibility
const VisuallyHidden: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: '1px',
    whiteSpace: 'nowrap',
    wordWrap: 'normal',
  }}>
    {children}
  </span>
);

export default function DispatcherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); 
  const router = useRouter();

  const isAuthenticated = false; // This is a placeholder, replace with actual auth check

  const handleLogout = () => {
    // Add any actual logout logic here (e.g., clearing tokens, API calls)
    console.log("Simulating logout...");
    router.push('/sign-in');
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <TriGoLogo />
            <h1 className="text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">TriGo Dispatcher</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
           <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dispatcher"}>
                <Link href="/dispatcher">
                  <span style={{ display: "contents" }}>
                    <LayoutDashboard />
                    <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
                  </span>
                </Link>
              </SidebarMenuButton>
           </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dispatcher/triders"}>
                <Link href="/dispatcher/triders">
                  <span style={{ display: "contents" }}>
                    <CarTaxiFront />
                    <span className="group-data-[collapsible=icon]:hidden">Triders</span>
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dispatcher/toda-management"}>
                <Link href="/dispatcher/toda-management"> 
                  <span style={{ display: "contents" }}>
                    <Landmark /> 
                    <span className="group-data-[collapsible=icon]:hidden">TODA Zones</span> 
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dispatcher/alerts"}>
                <Link href="/dispatcher/alerts"> 
                  <span style={{ display: "contents" }}>
                    <TriGoAlertLogo /> 
                    <span className="group-data-[collapsible=icon]:hidden">Alerts</span>
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dispatcher/channels"}>
                <Link href="/dispatcher/channels"> 
                  <span style={{ display: "contents" }}>
                    <MessagesSquare /> 
                    <span className="group-data-[collapsible=icon]:hidden">Channels</span>
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dispatcher/wallet"}>
                <Link href="/dispatcher/wallet"> 
                  <span style={{ display: "contents" }}>
                    <Wallet /> 
                    <span className="group-data-[collapsible=icon]:hidden">Wallet</span>
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton isActive={false} className="w-full">
                     <span style={{ display: "contents" }}>
                        <MoreHorizontal />
                        <span className="group-data-[collapsible=icon]:hidden">More Options</span>
                      </span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-48 ml-2 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:mt-2">
                  <DropdownMenuItem asChild>
                    <Link href="/dispatcher/profile" className="flex items-center w-full">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dispatcher/billing" className="flex items-center w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/dispatcher/help" className="flex items-center w-full">
                      <HelpCircleIcon className="mr-2 h-4 w-4" />
                      <span>Help Center</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout} className="flex items-center w-full cursor-pointer">
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    <span>Logout (Simulated)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>

          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
           <Separator className="my-2 group-data-[collapsible=icon]:hidden" />
           <div className="p-2 flex flex-col items-center justify-between group-data-[collapsible=icon]:justify-center space-y-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-full group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10" />
                  <span className="text-sm ml-2 group-data-[collapsible=icon]:hidden">
                    User Profile
                  </span>
                </div>
                <Button variant="outline" className="w-full group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:p-2">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="w-full group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:p-2" asChild>
                  <Link href="/sign-in">
                     <span style={{ display: "contents" }}>
                      <LogIn className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                      <span className="group-data-[collapsible=icon]:hidden">Sign In</span>
                    </span>
                  </Link>
                </Button>
                 <Button variant="default" className="w-full group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:p-2" asChild>
                  <Link href="/sign-up">
                    <span style={{ display: "contents" }}>
                      <UserPlus className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                      <span className="group-data-[collapsible=icon]:hidden">Sign Up</span>
                    </span>
                  </Link>
                </Button>
              </>
            )}
           </div>
            <Separator className="my-2 group-data-[collapsible=icon]:hidden" />
           <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dispatcher/settings"}>
                <Link href="/dispatcher/settings"> 
                  <span style={{ display: "contents" }}>
                    <Settings />
                    <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
         <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
          <div className="md:hidden"> {/* Only show trigger on mobile */}
            <SidebarTrigger>
              <VisuallyHidden>
                  <SheetTitle>Mobile Navigation Menu</SheetTitle>
              </VisuallyHidden>
            </SidebarTrigger>
          </div>
           <div className="flex items-center gap-2 md:hidden"> {/* Show logo/title on mobile */}
            <TriGoLogo />
            <h1 className="text-lg font-semibold text-primary">TriGo Dispatcher</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
             <Button variant="ghost" size="icon" asChild>
                <Link href="/dispatcher/alerts" aria-label="View Alerts">
                  <TriGoAlertLogo />
                </Link>
              </Button>
            {isAuthenticated ? (
              <Button variant="ghost" size="icon">
                <Users className="h-5 w-5"/>
              </Button>
            ) : (
               <Button variant="outline" size="icon" asChild className="md:hidden">
                  <Link href="/sign-in" aria-label="Sign In">
                    <LogIn className="h-4 w-4"/>
                  </Link>
                </Button>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
