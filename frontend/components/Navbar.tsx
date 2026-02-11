"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, LayoutDashboard, LogOut, User } from "lucide-react";
import { logger } from "@/lib/logger";
import { useState, useEffect } from "react";
import { GlobalSearch } from "./GlobalSearch";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { name: "Hosting", href: "/hosting" },
  { name: "VPN", href: "/vpn" },
  { name: "Compare", href: "/compare" },
  { name: "Calculator", href: "/calculator" },
  { name: "News", href: "/news" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    if (typeof window !== 'undefined') {
      const cachedAdmin = localStorage.getItem('isAdmin') === 'true';
      if (cachedAdmin) setIsAdmin(true);
    }

    const checkUserRole = async (uid: string) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', uid)
          .single();

        if (error) {
          console.warn("Error checking user role:", error);
          return;
        }

        if (mounted) {
          const isUserAdmin = profile?.role === 'admin';
          setIsAdmin(isUserAdmin);
          if (isUserAdmin) {
            localStorage.setItem('isAdmin', 'true');
          } else {
            localStorage.removeItem('isAdmin');
          }
        }
      } catch (err) {
        console.error("Failed to check user role:", err);
      }
    };

    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkUserRole(session.user.id);
        } else {
          setIsAdmin(false);
          localStorage.removeItem('isAdmin');
        }
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkUserRole(session.user.id);
        } else {
          setIsAdmin(false);
          localStorage.removeItem('isAdmin');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    router.push("/login");

    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error);

    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex h-16 items-center justify-between rounded-full border border-border/40 bg-background/70 px-6 shadow-sm backdrop-blur-xl mt-4 supports-[backdrop-filter]:bg-background/60">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground">
              Hosting<span className="text-primary">Arena</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <GlobalSearch />

            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/dashboard"
                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                    title="Admin Dashboard"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="rounded-full bg-muted hover:bg-destructive hover:text-destructive-foreground px-4 py-2 text-sm font-semibold text-foreground transition-all"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-full bg-transparent px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup" // Assuming you have or will make a signup page, otherwise login usually handles both or tabs
                  className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform hover:scale-105 active:scale-95 shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-24 left-6 right-6 rounded-3xl border border-border/40 bg-popover/95 p-6 shadow-xl backdrop-blur-2xl md:hidden animate-in fade-in slide-in-from-top-4 z-40">
          <div className="flex flex-col gap-4">
            <div className="mb-4">
              <GlobalSearch />
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium text-foreground py-2 border-b border-border/50"
              >
                {link.name}
              </Link>
            ))}

            <div className="mt-4 flex flex-col gap-3">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 text-lg font-medium py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-5 w-5" /> Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="rounded-xl bg-destructive/10 text-destructive px-4 py-3 text-center font-semibold mt-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-xl bg-muted px-4 py-3 text-center font-semibold text-foreground"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-xl bg-primary px-4 py-3 text-center font-semibold text-primary-foreground shadow-lg"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
