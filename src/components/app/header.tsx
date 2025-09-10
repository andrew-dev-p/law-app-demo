"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  LayoutDashboard,
  Settings as SettingsIcon,
  Menu as MenuIcon,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
];

// No additional menu; keep navigation minimal.

function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  return (
    <div className="md:hidden">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            aria-label="Open menu"
            size="icon"
            variant="outline"
            className="text-foreground border-border hover:bg-muted"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-1">
          <div className="py-1">
            {navItems.map((item) => {
              const active = pathname?.startsWith(item.href);
              const Icon =
                item.href === "/dashboard" ? LayoutDashboard : SettingsIcon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-card-border bg-white text-foreground shadow-sm">
      <div className="relative flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">
            Client Portal
          </Link>
          <nav className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const active = pathname?.startsWith(item.href);
              const Icon =
                item.href === "/dashboard" ? LayoutDashboard : SettingsIcon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-2 text-sm transition-colors border-b-2",
                    active
                      ? "border-[hsl(var(--primary))] text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <SignedOut>
            <Button
              asChild
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Create account</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
