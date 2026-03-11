import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/tasks';
import { requireAuth } from '@/lib/auth/guard';

/**
 * POST /api/admin/settings/top-providers
 * Saves the selected top 3 providers by updating their homepage_rank.
 */
export async function POST(request: NextRequest) {
    try {
        const authError = await requireAuth();
        if (authError) return authError;
        
        const supabase = createAdminClient();
        const body = await request.json();
        
        const { top3 } = body; // Array of 3 strings (affiliate IDs) or nulls

        if (!Array.isArray(top3) || top3.length !== 3) {
            return NextResponse.json({ error: 'top3 must be an array of exactly 3 items' }, { status: 400 });
        }

        // 1. Reset all current homepage_ranks to null
        const { error: resetError } = await supabase
            .from('affiliate_partners')
            .update({ homepage_rank: null })
            .not('homepage_rank', 'is', null);

        if (resetError) throw resetError;

        // 2. Set the new ranks individually (since they have different values 1, 2, 3)
        for (let i = 0; i < top3.length; i++) {
            const id = top3[i];
            if (id) { // ignore nulls (auto fallback)
                const { error: updateError } = await supabase
                    .from('affiliate_partners')
                    .update({ homepage_rank: i + 1 })
                    .eq('id', id);
                    
                if (updateError) throw updateError;
            }
        }

        return NextResponse.json({ message: 'Top 3 providers updated successfully' });
    } catch (error: any) {
        console.error('[Top Providers API] POST error:', error);
        return NextResponse.json(
            {
                error: 'Failed to update top providers',
                details: error.message || error.details || String(error)
            },
            { status: 500 }
        );
    }
}
