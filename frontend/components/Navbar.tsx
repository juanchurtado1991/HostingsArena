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

        if (error) return;

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
        logger.error("Failed to check user role:", err);
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
    router.push(`/${lang}/login`);
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex h-16 items-center justify-between rounded-full border border-border/40 bg-background/70 px-6 shadow-sm backdrop-blur-xl mt-4 supports-[backdrop-filter]:bg-background/60">
          <Link href={`/${lang}`} className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground">
              Hostings<span className="text-primary">Arena</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center lg:gap-3 xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={getLink(link.href)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname.includes(link.href) ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center lg:gap-2 xl:gap-4">
            <GlobalSearch />
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
            className="lg:hidden p-2 text-muted-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-24 left-6 right-6 rounded-3xl border border-border/40 bg-popover/95 p-6 shadow-xl backdrop-blur-2xl lg:hidden animate-in fade-in slide-in-from-top-4 z-40">
          <div className="flex flex-col gap-4">
            <div className="mb-4 flex flex-col gap-4">
              <GlobalSearch />
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
