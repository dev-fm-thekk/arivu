export interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  category_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[]; // e.g. ["Option A", "Option B", "Option C", "Option D"]
  answer: string;    // e.g. "A", "B", "C", "D" or the option text. Let's standardize on option index "A", "B", "C", "D" or text.
  explanation?: string | null;
  sub_category_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Test {
  id: string;
  title: string;
  sections: string[]; // text[] in postgres
  duration: number;   // in minutes
  total_questions: number;
  correct_mark: number;
  negative_mark: number;
  total_score: number;
  created_at?: string;
  updated_at?: string;
}

export interface Attempt {
  test_id: string;
  user_id: string;
  status: 'in_progress' | 'submitted' | 'expired';
  questions: Question[]; // jsonb array of Question
  answers: Record<string, string>; // jsonb object { [questionId]: selectedOption }
  submitted_at?: string | null;
  score?: number | null;
  created_at?: string;
  updated_at?: string;
}

// Joined representation of an attempt for listing/details
export interface AttemptWithTest extends Attempt {
  test: Test;
}
