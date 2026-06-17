export type Category = {
    id: number;
    name: string | null;
    slug: string;
}

export type QueryFetchOptions = {
    fetchAll?: boolean;
    fields?: Array<string>;
    limit?: number;
    start?: number;
    stop?: number;
}

export type Question = {
    id: number;
    question: string;
    options: any; // jsonb
    tags: string[]; // _text
    contributer: string; // uuid
    category_id: number;
    answer: string;
}

export type User = {
    id: string; // uuid
    name: string | null;
    email: string | null;
}

export type Test = {
    id: number;
    time_limit: number;
    total_attempts: number;
    title: string;
    created_by: string | null;
}

export type Attempt = {
    id: number;
    userId: string;
    score: number;
    started_at: string;
    test_id: number;
    submitted_at: string | null;
}

export type TestQuestion = {
    test_id: number;
    question_id: number;
    order_index: number | null;
}

export type TestAttemptQuestion = {
    attempt_id: number;
    question_id: number;
    selected_answer: string | null;
    is_correct: boolean | null;
}

export type RandomProportion = {
    categoryId: number;
    percent: number;
}

export type TestConfig = {
    total: number;
    proportion: Array<RandomProportion>;
}
