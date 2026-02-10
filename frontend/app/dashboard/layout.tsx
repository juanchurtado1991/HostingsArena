
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient();

    // 1. Check Authentication
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // 2. Check Admin Role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        // Redirect non-admins to home
        return redirect("/");
    }

    // 3. Render Dashboard
    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    );
}
