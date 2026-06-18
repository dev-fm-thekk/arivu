import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateQuestion, createRandomTest, evaluateTest } from './action';
import { createClient } from '@/src/utils/supabase/server';
import { cookies } from 'next/headers';

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('Test Actions', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    // To handle the final await
    then: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
    (cookies as any).mockResolvedValue({
      getAll: vi.fn(),
    });
    // Default mock for 'then' to make it behave like a promise
    mockSupabase.then.mockImplementation((onFulfilled) => {
      return Promise.resolve({ data: null, error: null }).then(onFulfilled);
    });
  });

  describe('generateQuestion', () => {
    it('should return questions for a category', async () => {
      mockSupabase.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: [{ id: 1 }, { id: 2 }], error: null }).then(onFulfilled);
      });
      const result = await generateQuestion(1, 1);
      expect(result.status).toBe('success');
      expect(result.data?.length).toBe(1);
    });

    it('should return failed if no questions found', async () => {
      mockSupabase.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: [], error: null }).then(onFulfilled);
      });
      const result = await generateQuestion(1, 1);
      expect(result.status).toBe('failed');
      expect(result.reason).toContain('doesn\'t exists');
    });
  });

  describe('createRandomTest', () => {
    it('should create a test and its questions', async () => {
      // 1. generateQuestion call
      mockSupabase.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: [{ id: 10 }], error: null }).then(onFulfilled);
      });
      
      // 2. Insert into tests call
      mockSupabase.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: { id: 100 }, error: null }).then(onFulfilled);
      });

      // 3. Insert into test_questions call
      mockSupabase.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ error: null }).then(onFulfilled);
      });

      const config = {
        total: 1,
        proportion: [{ categoryId: 1, percent: 100 }]
      };
      const testData = { title: 'Test', time_limit: 30, total_attempts: 1, created_by: 'user-1' };

      const result = await createRandomTest(config, testData);
      expect(result.status).toBe('success');
      expect(mockSupabase.from).toHaveBeenCalledWith('tests');
      expect(mockSupabase.from).toHaveBeenCalledWith('test_questions');
    });
  });

  describe('evaluateTest', () => {
    it('should calculate score and update attempt', async () => {
      // 1. Fetch attempt questions
      mockSupabase.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ 
          data: [
            { question_id: 1, selected_answer: 'A', questions: { answer: 'A' } },
            { question_id: 2, selected_answer: 'B', questions: { answer: 'C' } }
          ], 
          error: null 
        }).then(onFulfilled);
      });

      // 2. update is_correct (loop)
      mockSupabase.then.mockImplementation((onFulfilled) => {
        return Promise.resolve({ error: null }).then(onFulfilled);
      });

      const result = await evaluateTest(123);
      expect(result.status).toBe('success');
      expect(result.score).toBe(50);
      expect(mockSupabase.from).toHaveBeenCalledWith('attempts');
    });
  });
});
