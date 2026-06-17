import { createClient } from "@/utils/supabase/server";
import { Question, Test, TestConfig } from "@/utils/type";
import { shuffleArray } from "@/utils/utils";

export const generateQuestion = async (categoryId: number, count: number) => {
    const supabase = await createClient();

    try {
        let { data, error } = await supabase.from("questions").select("*").eq("category_id", categoryId);
        if (error) throw new Error(`DBError: ${error.message}`);
        if (data?.length === 0) return {
            status: "failed",
            reason: `Questions with category_id ${categoryId} doesn't exists` 
        };
        let shuffled = shuffleArray(data!) as Array<Question>;
        let result = shuffled.slice(0, Math.min(count, shuffled.length));
        return { 
            status: "success",
            data: result
        };
    } catch(err) {
        console.error(err);
        return { status: "failed", error: err }
    }
} 

export const createRandomTest = async (config: TestConfig, test: Omit<Test, "id">) => {
    const supabase = await createClient();

    try {
        let total = config.total;
        let questionCounts = config.proportion.map(item => {
            let count = Math.round((item.percent / 100) * total);
            return {
                category: item.categoryId,
                count,
            };
        });

        const questionsPromises = questionCounts.map(item => generateQuestion(item.category, item.count));
        const results = await Promise.all(questionsPromises);

        let allQuestions: Question[] = [];
        for (const res of results) {
            if (res.status === "success" && res.data) {
                allQuestions = [...allQuestions, ...res.data];
            } else if (res.status === "failed") {
                console.warn(res.reason);
            }
        }

        if (allQuestions.length === 0) {
            return {
                status: "failed",
                reason: "No questions found for the selected categories"
            };
        }

        // Shuffle all collected questions
        allQuestions = shuffleArray(allQuestions);
        // Trim to total if necessary (due to rounding)
        allQuestions = allQuestions.slice(0, total);

        // 1. Insert into tests table
        const { data: testData, error: testError } = await supabase
            .from('tests')
            .insert(test)
            .select()
            .single();

        if (testError) throw new Error(`TestCreateError: ${testError.message}`);

        const newTest = testData as Test;

        // 2. Insert into test_questions table
        const testQuestions = allQuestions.map((q, index) => ({
            test_id: newTest.id,
            question_id: q.id,
            order_index: index
        }));

        const { error: tqError } = await supabase
            .from('test_questions')
            .insert(testQuestions);

        if (tqError) throw new Error(`TestQuestionsInsertError: ${tqError.message}`);

        return {
            status: "success",
            message: "Created Test",
            data: newTest
        };
    } catch (err) {
        console.error(err);
        return { status: "failed", error: err };
    }
}


export const evaluateTest = async (attemptId: number) => {
    const supabase = await createClient();

    try {
        // 1. Fetch attempt questions and their correct answers from the questions table
        const { data: attemptQuestions, error: aqError } = await supabase
            .from('test_attempt_questions')
            .select(`
                question_id,
                selected_answer,
                questions:questions(answer)
            `)
            .eq('attempt_id', attemptId);

        if (aqError) throw aqError;
        if (!attemptQuestions || attemptQuestions.length === 0) {
            throw new Error("No questions found for this attempt");
        }

        let correctCount = 0;
        for (const aq of attemptQuestions) {
            // @ts-ignore - Supabase join type might not be inferred correctly
            const isCorrect = aq.selected_answer === aq.questions?.answer;
            if (isCorrect) correctCount++;

            await supabase
                .from('test_attempt_questions')
                .update({ is_correct: isCorrect })
                .eq('attempt_id', attemptId)
                .eq('question_id', aq.question_id);
        }

        const score = (correctCount / attemptQuestions.length) * 100;

        // 2. Update attempt score and submitted_at
        const { error: attemptUpdateError } = await supabase
            .from('attempts')
            .update({ 
                score, 
                submitted_at: new Date().toISOString() 
            })
            .eq('id', attemptId);

        if (attemptUpdateError) throw attemptUpdateError;

        return {
            status: "success",
            score
        };
    } catch (err) {
        console.error(err);
        return {
            status: "failed",
            error: err
        }
    }
}