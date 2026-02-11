import { NextResponse } from 'next/server';

const GITHUB_PAT = process.env.GITHUB_PAT;
const REPO_OWNER = 'juanchurtado1991';
const REPO_NAME = 'HostingsArena';
const WORKFLOW_FILE = 'daily_update.yml';

async function githubRequest(endpoint: string, options: RequestInit = {}) {
    if (!GITHUB_PAT) {
        throw new Error('GITHUB_PAT is not set in environment variables');
    }

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/${endpoint}`;

    const headers = {
        'Authorization': `Bearer ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub API Error: ${response.status} - ${errorText}`);
    }

    return response;
}

export async function GET() {
    try {
        const response = await githubRequest(`actions/workflows/${WORKFLOW_FILE}/runs?per_page=5`);
        const data = await response.json();

        return NextResponse.json({
            runs: data.workflow_runs.map((run: any) => ({
                id: run.id,
                status: run.status, // queued, in_progress, completed
                conclusion: run.conclusion, // success, failure, neutral, etc.
                created_at: run.created_at,
                updated_at: run.updated_at,
                html_url: run.html_url
            }))
        });

    } catch (error: any) {
        console.error("GitHub API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST() {
    try {
        await githubRequest(`actions/workflows/${WORKFLOW_FILE}/dispatches`, {
            method: 'POST',
            body: JSON.stringify({
                ref: 'master' // or main, depending on your default branch
            })
        });

        return NextResponse.json({ message: "Workflow triggered successfully" });

    } catch (error: any) {
        console.error("GitHub API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
