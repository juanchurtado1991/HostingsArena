export const personas = [
    "The Enthusiastic Futurist (Loves innovation, optimistic)",
    "The Helpful Mentor (Explains things simply, wants you to succeed)",
    "The Digital AESTHETE (Appreciates good UI/UX and clean code)",
    "The Performance Junkie (Gets excited about speed and uptime)",
    "The Ruthless CTO (Pragmatic, cost-conscious, focuses on ROI and scalability)",
    "The Privacy Paranoiac (Obsessed with surveillance, logs, and jurisdiction)",
    "The Startup Hustler (Focuses on rapid deployment, growth hacking, and cheap scaling)",
    "The Enterprise Architect (Formal, structured, cares about compliance and SLAs)",
    "The Budget Hacking Student (Finds the absolute cheapest way to do everything)",
    "The eCommerce Tycoon (Focuses purely on conversion rates, speed, and reliability)",
    "The DevOps Wizard (Speaks in CI/CD, containers, and CLI commands)",
    "The WordPress Purist (Judges everything by how well it runs WP, plugins, and caching)",
    "The Gamer/Streamer (Focuses on low latency, DDoS protection, and mod support)"
];

export const structures = [
    {
        name: "The Hero's Journey",
        desc: "A narrative review. Start with a problem, introduce the provider as a potential solution, face challenges (cons), and reach a resolution.",
        html_guideline: "Use <h2> for chapters (The Call, The Trial, The Reward). Focus on storytelling."
    },
    {
        name: "The Deep Dive Technical Analysis",
        desc: "A rigorous, data-heavy review. Focus on benchmarks, speed tests, and raw specs.",
        html_guideline: "Use <div class='data-box'> for metrics. Compare strictly against competitors."
    },
    {
        name: "The Ultimate Buyer's Guide",
        desc: "Educational and helpful. Explain WHY features matter while reviewing the provider.",
        html_guideline: "Use 'Who is this for?' sections and 'Pro Tips' boxes."
    },
    {
        name: "The 'Vs. The World' Showdown",
        desc: "A comparative format pitting the provider against 3 major competitors (AWS, DigitalOcean, Bluehost) in rapid-fire rounds.",
        html_guideline: "Use <h3>Round 1: Speed</h3>, <h3>Round 2: Price</h3> structure. Be combative but fair."
    },
    {
        name: "The 24-Hour Stress Test Diary",
        desc: "A chronological log of a 24-hour period pushing the server to its limits.",
        html_guideline: "Use timestamps (e.g., <h4>08:00 AM - The Setup</h4>). Focus on the 'feeling' of the server under load."
    },
    {
        name: "The 'Migrator's Nightmare' Log",
        desc: "Written from the perspective of someone moving AWAY from a bad host to this one.",
        html_guideline: "Start with a 'Horror Story' section about the old host. Then the 'Salvation' with the new one."
    },
    {
        name: "The ROI Analysis Report",
        desc: "A business-centric review focusing on cost-per-request, value for money, and hidden fees.",
        html_guideline: "Use tables for 'Cost vs Competitors'. Focus on 'Value' over 'Price'."
    },
    {
        name: "The 'Explain It Like I'm 5' (ELI5)",
        desc: "Extremely simple, metaphor-heavy review for absolute beginners.",
        html_guideline: "Use simple language. 'Imagine your website is a house...' analogies."
    },
    {
        name: "The Q&A Interview",
        desc: "A mock interview format where the 'Interviewer' asks tough questions and the 'Review' provides the answers.",
        html_guideline: "Use <strong>Q:</strong> and <strong>A:</strong> format. Ask the hard questions."
    },
    {
        name: "The 'TL;DR' Executive Brief",
        desc: "Bullet-point heavy, concise, actionable. No fluff. Just pros, cons, and verdict.",
        html_guideline: "Use bullet points heavily. Short sentences. <h3>The Good</h3>, <h3>The Bad</h3>."
    }
];

export const narrativeArcs = [
    "The 'Skeptic Converted': You thought it was trash, but were proven wrong.",
    "The 'Hidden Flaw': It looks perfect on paper, but you found a deal-breaker.",
    "The 'David vs Goliath': Comparing this small provider to AWS/Google and finding it better for specific things.",
    "The 'Migration Nightmare': You are testing this because your previous host crashed.",
    "The 'Speed Freak': You care ONLY about milliseconds and raw performance."
];

export const stressTests = [
    "Installing a heavy WooCommerce store with 5,000 products.",
    "Running a Minecraft Server with 50+ mods.",
    "Simulating a Reddit 'Hug of Death' traffic spike.",
    "Uploading a 10GB SQL database dump via CLI.",
    "Streaming 4K video through the VPN from 3 different continents simultaneously."
];
