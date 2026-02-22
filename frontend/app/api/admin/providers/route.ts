import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "hosting"; // hosting or vpn
    const search = searchParams.get("search") || "";
    
    const supabase = await createClient();
    const table = type === "vpn" ? "vpn_providers" : "hosting_providers";
    
    let query = supabase.from(table).select("*");
    
    if (search) {
        query = query.ilike("provider_name", `%${search}%`);
    }
    
    const { data, error } = await query.order("provider_name", { ascending: true });
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
}

export async function PATCH(request: Request) {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();
    
    // Check auth/role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
        
    if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    // Extract all potential fields from body
    const { 
        id, type, provider_name, slug, website_url, provider_type, plan_name,
        pricing_monthly, pricing_yearly, pricing_2year, pricing_3year, renewal_price, renewal_price_monthly,
        setup_fee, money_back_days, storage_gb, storage_type, bandwidth, ram_mb, 
        websites_allowed, databases_allowed, inodes, web_server, control_panel, 
        uptime_guarantee, php_versions, data_center_locations, backup_frequency, max_processes,
        avg_speed_mbps, server_count, country_count, city_count, simultaneous_connections, 
        jurisdiction, encryption_type, protocols, audits,
        free_ssl, free_domain, backup_included, wordpress_optimized, free_migration,
        has_kill_switch, dns_leak_protection, ipv6_leak_protection, streaming_support,
        support_score, support_quality_score, performance_grade, raw_data, features
    } = body;

    if (!id || !type) {
        return NextResponse.json({ error: "Missing ID or type" }, { status: 400 });
    }
    
    const table = type === 'hosting' ? 'hosting_providers' : 'vpn_providers';
    
    // Build update object dynamically to avoid sending undefined fields
    const updateData: any = {
        provider_name, slug, website_url, provider_type, plan_name,
        pricing_monthly, pricing_yearly, pricing_2year, pricing_3year,
        setup_fee, money_back_days, storage_gb, storage_type, bandwidth, ram_mb, 
        websites_allowed, databases_allowed, inodes, web_server, control_panel, 
        uptime_guarantee, php_versions, data_center_locations, backup_frequency, max_processes,
        avg_speed_mbps, server_count, country_count, city_count, simultaneous_connections, 
        jurisdiction, encryption_type, protocols, audits,
        free_ssl, free_domain, backup_included, wordpress_optimized, free_migration,
        has_kill_switch, dns_leak_protection, ipv6_leak_protection, streaming_support,
        performance_grade, raw_data, features
    };

    if (type === 'hosting') {
        updateData.support_score = support_score;
        updateData.renewal_price = renewal_price;
    } else {
        updateData.support_quality_score = support_quality_score;
        updateData.renewal_price_monthly = renewal_price_monthly;
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data, error } = await adminSupabase
        .from(table)
        .update(updateData)
        .eq('id', id)
        .select();
        
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data || data.length === 0) {
        return NextResponse.json({ error: "Provider not found or no changes made" }, { status: 404 });
    }
    
    return NextResponse.json(data[0]);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();
    
    // Check auth/role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
        
    if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { 
        type, provider_name, slug, website_url, provider_type, plan_name,
        pricing_monthly, pricing_yearly, pricing_2year, pricing_3year, renewal_price, renewal_price_monthly,
        setup_fee, money_back_days, storage_gb, storage_type, bandwidth, ram_mb, 
        websites_allowed, databases_allowed, inodes, web_server, control_panel, 
        uptime_guarantee, php_versions, data_center_locations, backup_frequency, max_processes,
        avg_speed_mbps, server_count, country_count, city_count, simultaneous_connections, 
        jurisdiction, encryption_type, protocols, audits,
        free_ssl, free_domain, backup_included, wordpress_optimized, free_migration,
        has_kill_switch, dns_leak_protection, ipv6_leak_protection, streaming_support,
        support_score, support_quality_score, performance_grade, raw_data, features
    } = body;

    if (!type || !provider_name) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const table = type === 'hosting' ? 'hosting_providers' : 'vpn_providers';
    
    const insertData: any = {
        provider_name, slug: slug || provider_name.toLowerCase().replace(/\s+/g, '-'), 
        website_url, provider_type, plan_name,
        pricing_monthly, pricing_yearly, pricing_2year, pricing_3year,
        setup_fee, money_back_days, storage_gb, storage_type, bandwidth, ram_mb, 
        websites_allowed, databases_allowed, inodes, web_server, control_panel, 
        uptime_guarantee, php_versions, data_center_locations, backup_frequency, max_processes,
        avg_speed_mbps, server_count, country_count, city_count, simultaneous_connections, 
        jurisdiction, encryption_type, protocols, audits,
        free_ssl, free_domain, backup_included, wordpress_optimized, free_migration,
        has_kill_switch, dns_leak_protection, ipv6_leak_protection, streaming_support,
        performance_grade, raw_data, features
    };

    if (type === 'hosting') {
        insertData.support_score = support_score || 70;
        insertData.renewal_price = renewal_price || pricing_monthly;
    } else {
        insertData.support_quality_score = support_quality_score || 70;
        insertData.renewal_price_monthly = renewal_price_monthly || pricing_monthly;
    }

    // Remove undefined values
    Object.keys(insertData).forEach(key => insertData[key] === undefined && delete insertData[key]);

    const { data, error: insertError } = await adminSupabase
        .from(table)
        .insert([insertData])
        .select();
        
    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    
    return NextResponse.json(data[0]);
}
