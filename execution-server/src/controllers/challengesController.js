import { withSupabase } from '@supabase/server';

export default {
    createChallenge: withSupabase({ auth: 'user' }, async (req, ctx) => {
        const { supabase, userClaims } = ctx
        const { id, email, role } = userClaims;

        const result = await supabase.from('challenges').insert(req.body);
        return Response.json(result, { status: result.status });
    }),

    fetchChallenge: withSupabase({ auth: 'user' }, async (req, ctx) => {
        const { supabase, userClaims } = ctx;
        const { id, email, role } = userClaims;
        
        const result = await supabase.from('challenges').select("*").eq('owner', id);
        
        return Response.json(result, { status: result.status });
    }),

    fetchChallengeById: withSupabase({ auth: 'user' }, async (req, ctx) => {
        const { supabase, userClaims } = ctx;
        const { id, email, role } = userClaims;

        const result = await supabase.from('challenges').select("*").eq('id', id).limit(1);
        return Response.json(result, { status: result.status });
    })
}