"use server";

import { createClient } from "@/src/utils/supabase/server";

export const getQuestionsByCategory = async (categoryId: string) => {
    const supabase = await createClient();

    try {
        let { data, error } = await supabase
            .from("questions")
            .select("*, sub_categories!inner(category_id)")
            .eq("sub_categories.category_id", categoryId);
            
        if (error) throw new Error(`db error: ${error.message}`);
        if (data?.length === 0) return {
            status: "failed",
            reason: `questions with category ${categoryId} doesn't exists`
        };

        return {
            status: "success",
            body: data
        };
    } catch(err: any) {
        console.error(err);
        return { status: "failed", error: err.message || err };
    }
}

export const getQuestionById = async (id: string) => {
    const supabase = await createClient();

    try {
        let { data, error } = await supabase.from("questions").select("*").eq("id", id);
        if (error) throw new Error(`db error: ${error.message}`);
        if (data?.length === 0 ) return {
            status: "failed",
            reason: `question with id ${id} doesn't exists`
        };

        return {
            status: "success",
            payload: data
        };
    } catch(err: any) {
        return {
            status : "failed",
            error: err.message || err
        };
    }
}