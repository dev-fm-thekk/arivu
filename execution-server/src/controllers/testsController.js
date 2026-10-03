import { withSupabase } from "@supabase/server";
import { runTestCases } from '../core/index.js';

export default {
    runTests: withSupabase({ auth: 'user' }, async (req, ctx) => {
        const { supabase, userClaims } = ctx;
        const { email, id, role } = userClaims;
        
        const id = req.params.id;
        const { loc, lang } = req.body;

        const test_cases = await supabase.from('test_cases').select('*').eq("challenge_id", id);
        
        const mappedTestCases = test_cases.data.map(item => {
            return {
                id: item.id,
                input: item.input,
                expected: item.expected,
            }
        })
        const result = await runTestCases(loc, lang, mappedTestCases);
        return Response.json(result);
    })
}