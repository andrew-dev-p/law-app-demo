"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const primary = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/intake", label: "Intake" },
  { href: "/negotiations", label: "Negotiations" },
];

const secondary = [
  { href: "/check-ins", label: "Check-ins" },
  { href: "/bills-records", label: "Bills & Records" },
  { href: "/demand-review", label: "Demand" },
  { href: "/settlement", label: "Settlement" },
  { href: "/litigation", label: "Litigation" },
];

function MoreMenu() {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">More</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        <div className="py-1">
          {secondary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 text-sm rounded-md hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="md:hidden">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">Menu</Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-1">
          <div className="py-1">
            {[...primary, ...secondary].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-sm rounded-md hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-primary text-primary-foreground shadow-sm">
      <div className="max-w-6xl mx-auto relative flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">Client Portal</Link>
          <MobileMenu />
          <nav className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar">
            {primary.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm transition-colors border-b-2",
                    active
                      ? "border-[#2563EB] text-white"
                      : "border-transparent text-white/80 hover:text-white hover:border-white/30"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <MoreMenu />
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <SignedOut>
            <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Create account</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild className="hidden sm:inline-flex">
              <Link href="/intake">Start Intake</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
