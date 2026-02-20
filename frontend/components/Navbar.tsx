"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { GlobalSearch } from "./GlobalSearch";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

interface NavbarProps {
  dict?: any;
  lang?: string;
}

export function Navbar({ dict, lang = 'en' }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  const getLink = (path: string) => `/${lang}${path}`;

  const navLinks = [
    { name: dict?.nav?.hosting || "Hosting", href: "/hosting" },
    { name: dict?.nav?.vpn || "VPN", href: "/vpn" },
    { name: dict?.nav?.compare || "Compare", href: "/compare" },
    { name: dict?.nav?.calculator || "Calculator", href: "/calculator" },
    { name: dict?.nav?.news || "News", href: "/news" },
  ];

  useEffect(() => {
    let mounted = true;

    // Fast path: Check localStorage first for immediate UI update
    if (typeof window !== 'undefined') {
      const cachedAdmin = localStorage.getItem('isAdmin') === 'true';
      if (cachedAdmin) setIsAdmin(true);
    }

    const checkUserRole = async (uid: string) => {
      console.log('[Navbar] Checking role for UID:', uid);

      try {
        // Create a timeout promise (increase to 15s for more reliability)
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), 15000)
        );

        // Race the query against the timeout
        const { data: profile, error }: any = await Promise.race([
          supabase
            .from('profiles')
            .select('role')
            .eq('id', uid)
            .single(),
          timeout
        ]);

        if (error) {
          // Log as info if it's just a missing profile (expected for new users)
          if (error.code === 'PGRST116') {
            console.log('[Navbar] Profile not created yet.');
          } else {
            console.warn('[Navbar] Profile query issue:', error.message);
          }

          if (mounted) {
            setIsAdmin(false);
            localStorage.removeItem('isAdmin');
          }
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
      } catch (err: any) {
        // Only log if it's NOT a timeout to avoid spamming the user
        if (err.message === 'Query timeout') {
          console.warn('[Navbar] Role check timed out. Falling back to cached state.');
        } else {
          console.error('[Navbar] Unexpected error in role check:', err);
        }

        if (mounted) {
          // Fallback to cached value if it's a timeout, or false if it's an error
          const cached = localStorage.getItem('isAdmin') === 'true';
          setIsAdmin(cached);
        }
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      logger.log('AUTH', `Navbar Auth Event: ${event}`);

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
    logger.log('AUTH', "Initiating Sign Out...");
    try {
      // 1. Clear local state immediately for visual feedback
      setUser(null);
      setIsAdmin(false);

      if (typeof window !== 'undefined') {
        localStorage.removeItem('isAdmin');
      }

      // 2. Call Supabase Sign Out
      // We don't await this if we want speed, but awaiting ensures cookies are cleared
      await supabase.auth.signOut();

      // 3. Force a hard refresh/redirect to ensure all cache and cookies are flushed
      window.location.href = `/${lang}/login`;

    } catch (err) {
      logger.error("Sign out error - forcing redirect", err);
      window.location.href = `/${lang}/login`;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex h-14 items-center justify-between rounded-full border border-border/40 bg-background/70 px-6 shadow-sm backdrop-blur-xl mt-2 supports-[backdrop-filter]:bg-background/60">
          <Link href={`/${lang}`} className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground">
              Hostings<span className="text-primary">Arena</span>
            </span>
          </Link>

          <div className="hidden xl:flex items-center gap-4 2xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={getLink(link.href)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                  pathname.includes(link.href) ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden xl:flex items-center gap-2 2xl:gap-4">
            <GlobalSearch lang={lang} />
            <LocaleSwitcher />

            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href={getLink("/dashboard")}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="rounded-full bg-muted hover:bg-destructive hover:text-destructive-foreground px-4 py-2 text-sm font-semibold text-foreground transition-all"
                >
                  {dict?.nav?.sign_out || "Sign Out"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href={`/${lang}/login`}
                  className="rounded-full bg-transparent px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {dict?.nav?.login || "Sign In"}
                </Link>
                <Link
                  href={`/${lang}/signup`}
                  className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform hover:scale-105 active:scale-95 shadow-md"
                >
                  {dict?.nav?.get_started || "Get Started"}
                </Link>
              </div>
            )}
          </div>

          <button
            className="xl:hidden p-2 text-muted-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-20 left-6 right-6 rounded-3xl border border-border/40 bg-popover/95 p-6 shadow-xl backdrop-blur-2xl xl:hidden animate-in fade-in slide-in-from-top-4 z-40">
          <div className="flex flex-col gap-4">
            <div className="mb-4 flex flex-col gap-4">
              <GlobalSearch lang={lang} />
              <div className="flex justify-start px-2">
                <LocaleSwitcher />
              </div>
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={getLink(link.href)}
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
                      href={getLink("/dashboard")}
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
                    {dict?.nav?.sign_out || "Sign Out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/${lang}/login`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-xl bg-muted px-4 py-3 text-center font-semibold text-foreground"
                  >
                    {dict?.nav?.login || "Sign In"}
                  </Link>
                  <Link
                    href={`/${lang}/signup`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-xl bg-primary px-4 py-3 text-center font-semibold text-primary-foreground shadow-lg"
                  >
                    {dict?.nav?.get_started || "Get Started"}
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
