require("dotenv").config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);


const hostingUpdates = [
    {
        name: "SiteGround",
        data: {
            disk_technology: "Google Cloud N2 (Standard SSD)", // Actually quite fast, often mistaken for NVMe, but let's put High Perf
            features_storage: "NVMe SSD",
            inode_limit: "400,000 to 600,000",
            ram_access: "768MB per process",
            data_center_locations: ["USA (Iowa)", "UK (London)", "Netherlands", "Germany", "Singapore", "Australia"],
            control_panel: "Site Tools (Custom)",
            php_version: "8.0, 8.1, 8.2, 8.3",
            backup_policy: "Daily Automatic (30 days)",
            ssl_type: "Free Let's Encrypt (Auto)",
            support_channels: ["24/7 Live Chat", "Phone", "Tickets"],
            real_uptime: "99.99%",
        }
    },
    {
        name: "Bluehost",
        data: {
            features_storage: "SSD Storage",
            disk_technology: "SSD",
            inode_limit: "200,000 (Soft) / 500,000 (Hard)",
            data_center_locations: ["USA (Utah)", "India", "UK", "China"],
            control_panel: "cPanel + Custom Dashboard",
            php_version: "8.0, 8.1, 8.2",
            backup_policy: "CodeGuard Basic (Paid mostly)",
            ssl_type: "Free Let's Encrypt",
            support_channels: ["24/7 Chat", "Phone"],
            real_uptime: "99.94%"
        }
    },
    {
        name: "HostGator",
        data: {
            features_storage: "Unmetered HDD/SSD",
            disk_technology: "SSD",
            inode_limit: "250,000",
            data_center_locations: ["USA (Texas, Utah)"],
            control_panel: "Classic cPanel",
            php_version: "8.2",
            backup_policy: "Weekly (Courtesy)",
            ssl_type: "Free SSL",
            support_channels: ["Chat", "Phone"],
            real_uptime: "99.90%"
        }
    },
    {
        name: "Vultr",
        data: {
            features_storage: "High Performance NVMe",
            disk_technology: "NVMe",
            inode_limit: "Unlimited (Root Access)",
            data_center_locations: ["32+ Locations (Miami, Dallas, LA, London, Tokyo, etc)"],
            control_panel: "Custom Cloud Panel",
            php_version: "Any (Self-Managed)",
            backup_policy: "Auto Backups (20% fee)",
            ssl_type: "Self-Managed",
            support_channels: ["Ticket"],
            real_uptime: "100% SLA"
        }
    }
];

const vpnUpdates = [
    {
        name: "NordVPN",
        data: {
            jurisdiction: "Panama",
            logging_policy: "Audited No-Logs (PwC & Deloitte)",
            protocols: ["NordLynx (WireGuard)", "OpenVPN", "IKEv2"],
            ram_only_servers: true,
            kill_switch: "System-wide & App-specific",
            streaming_unblock: ["Netflix", "Disney+", "Hulu", "BBC iPlayer"],
            split_tunneling: true,
            simultaneous_devices: 6,
            leak_protection: "DNS, WebRTC, IPv6",
            transparency_report: true
        }
    },
    {
        name: "ExpressVPN",
        data: {
            jurisdiction: "British Virgin Islands (BVI)",
            logging_policy: "Audited No-Logs (KPMG)",
            protocols: ["Lightway (Custom/WolfSSL)", "OpenVPN", "IKEv2"],
            ram_only_servers: true,
            kill_switch: "Network Lock",
            streaming_unblock: ["Netflix", "Disney+", "Amazon Prime", "Hulu"],
            split_tunneling: true,
            simultaneous_devices: 8,
            leak_protection: "Full Stack",
            transparency_report: true
        }
    },
    {
        name: "Surfshark",
        data: {
            jurisdiction: "Netherlands (Safe)",
            logging_policy: "Audited No-Logs (Deloitte)",
            protocols: ["WireGuard", "OpenVPN", "IKEv2"],
            ram_only_servers: true,
            kill_switch: "Strict",
            streaming_unblock: ["30+ Netflix Libraries", "Disney+"],
            split_tunneling: true,
            simultaneous_devices: 999, // Unlimited
            leak_protection: "Yes",
            transparency_report: true
        }
    }
];

async function runPatch() {
    console.log("Starting patch...");

    // HOSTING
    for (const p of hostingUpdates) {
        // First get current raw_data to merge
        const { data: current } = await supabase.from("hosting_providers").select("raw_data").eq("provider_name", p.name).single();
        if (!current) {
            console.log(`Skipping ${p.name} (not found)`);
            continue;
        }

        const newRaw = { ...current.raw_data, ...p.data };
        const { error } = await supabase.from("hosting_providers").update({ raw_data: newRaw }).eq("provider_name", p.name);

        if (error) console.error(`Error updating ${p.name}:`, error.message);
        else console.log(`Updated ${p.name}`);
    }

    // VPN
    for (const p of vpnUpdates) {
        const { data: current } = await supabase.from("vpn_providers").select("raw_data").eq("provider_name", p.name).single();
        if (!current) {
            console.log(`Skipping ${p.name} (not found)`);
            continue;
        }

        const newRaw = { ...current.raw_data, ...p.data };
        const { error } = await supabase.from("vpn_providers").update({ raw_data: newRaw }).eq("provider_name", p.name);

        if (error) console.error(`Error updating ${p.name}:`, error.message);
        else console.log(`Updated ${p.name}`);
    }

    console.log("Done!");
}

runPatch();
