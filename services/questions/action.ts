import { createClient } from "@/utils/supabase/server";
import { Question } from "@/utils/type";
import { getAuthenticatedUser } from "../auth/actions";

const authorizeContributor = async (id: string) => {
    const supabase = await createClient();

    try {
        const { user, error } = await getAuthenticatedUser();

        if (!user || error) {
            return {
                status: "error",
                error: error ?? "User not authenticated",
            };
        }

        const { data: contributor, error: contributorError } =
            await supabase
                .from("user")
                .select("id")
                .eq("id", id)
                .single();

        if (contributorError || !contributor) {
            return {
                status: "error",
                error: "Contributor does not exist",
            };
        }

        return {
            status: user.id === id
                ? "authorized"
                : "unauthorized",
        };
    } catch (err) {
        console.error(err);

        return {
            status: "error",
            error: err,
        };
    }
};

export const createQuestion = async (
    question: Omit<Question, "id">
) => {
    const supabase = await createClient();

    try {
        const authResult = await authorizeContributor(
            question.contributer
        );

        if (authResult.status === "error") {
            throw new Error(String(authResult.error));
        }

        if (authResult.status === "unauthorized") {
            return {
                status: "failed",
                reason: "You do not have permission to create questions",
            };
        }

        const { error } = await supabase
            .from("questions")
            .insert(question);

        if (error) {
            throw new Error(error.message);
        }

        return {
            status: "success",
            message: "Question created successfully",
        };
    } catch (err) {
        console.error(err);

        return {
            status: "failed",
            error: err,
        };
    }
};