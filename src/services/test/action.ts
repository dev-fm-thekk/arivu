"use server";

import { createClient } from "@/src/utils/supabase/server";
import { Test } from "@/src/utils/type";

export const createTest = async (test: Omit<Test, "id" | "created_at" | "updated_at">) => {
    const supabase = await createClient();

    try {
        let { data, error } = await supabase.from('tests').insert(test).select().single();
        if (error) return {
            status: "failed",
            reason: `db error: ${error.message}`
        }

        return {
            status: "success",
            body: data
        }
    } catch(err) {
        return { status: "failed", error: err }
    }
}

export const createAttempt = async (testId: string) => {
    const supabase = await createClient();

    try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
            return {
                status: "failed",
                reason: "Unauthorized: Please log in."
            }
        }

        let { data, error } = await supabase.from("tests").select("*").eq("id", testId).limit(1);

        if (error) throw new Error(`db error ${error.message}`);
        if (!data || data.length === 0) return {
            status: "failed",
            reason: `test with ${testId} does not exists`
        }

        let test = data[0] as Test;
        let { sections, total_questions } = test;

        let sub_categories_promises = sections.map(async (item: string) => {
            let { data: catData, error: catError } = await supabase
                .from("categories")
                .select("id")
                .eq("name", item)
                .limit(1);

            if (catError || !catData || catData.length === 0) {
                return {
                    category: item,
                    subCategories: []
                }
            }

            let categoryId = catData[0].id;
            let { data: subcategories } = await supabase
                .from("sub_categories")
                .select("*")
                .eq("category_id", categoryId);
            
            return {
                category: item,
                subCategories: subcategories || []
            }
        });

        let sub_categories = await Promise.all(sub_categories_promises);
        let sectionQCount = Math.floor(total_questions / sections.length);

        let questionsToUse: any[] = [];

        for (let i = 0; i < sub_categories.length; i++) {
            const subCategoryInfo = sub_categories[i];
            const subCats = subCategoryInfo.subCategories;
            if (subCats.length === 0) continue;

            const qCountPerSub = Math.floor(sectionQCount / subCats.length) || 1;
            
            for (let j = 0; j < subCats.length; j++) {
                const subCat = subCats[j];
                let { data: subQs } = await supabase
                    .from("questions")
                    .select("*")
                    .eq("sub_category_id", subCat.id);

                if (subQs && subQs.length > 0) {
                    const shuffled = [...subQs].sort(() => 0.5 - Math.random());
                    questionsToUse.push(...shuffled.slice(0, qCountPerSub));
                }
            }
        }

        // Pad if we don't have enough questions
        if (questionsToUse.length < total_questions) {
            const needed = total_questions - questionsToUse.length;
            const alreadySelectedIds = questionsToUse.map(q => q.id);
            
            let query = supabase.from("questions").select("*");
            if (alreadySelectedIds.length > 0) {
                query = query.not("id", "in", `(${alreadySelectedIds.join(",")})`);
            }
            
            const { data: padQs } = await query.limit(needed);
            if (padQs && padQs.length > 0) {
                questionsToUse.push(...padQs);
            }
        }

        // Select up to total_questions
        questionsToUse = questionsToUse.slice(0, total_questions);

        const newAttempt = {
            test_id: testId,
            user_id: user.id,
            status: "started",
            questions: questionsToUse,
            answers: {},
            submitted_at: null,
            score: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        let { data: attempt, error: attemptError } = await supabase
            .from("attempts")
            .insert(newAttempt)
            .select()
            .single();

        if (attemptError) {
            return {
                status: "failed",
                reason: `db error: ${attemptError.message}`
            }
        }

        return {
            status: "success",
            body: attempt
        };

    } catch(err: any) {
        return { 
            status: "failed",
            error: err.message || err
        }
    }
}