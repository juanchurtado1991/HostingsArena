"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
    } else {
      alert("Account created! Please check your email to verify.");
      router.push("/login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl -z-10" />

      <Card className="w-full max-w-sm rounded-[2rem] border-border/50 shadow-2xl glass">
        <CardContent className="p-8 pt-12 text-center">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-500">
              <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold mb-2 tracking-tight">Create Account</h1>
          <p className="text-muted-foreground mb-8">Join HostingArena to save your comparisons</p>

          <form onSubmit={handleSignUp} className="space-y-4 text-left">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-full text-lg shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-8 text-sm text-muted-foreground">
             Already has an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
