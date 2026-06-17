import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createQuestion } from './action';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getAuthenticatedUser } from '../auth/actions';

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('../auth/actions', () => ({
  getAuthenticatedUser: vi.fn(),
}));

describe('Question Actions', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    then: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
    (cookies as any).mockResolvedValue({
      getAll: vi.fn(),
    });
    mockSupabase.then.mockImplementation((onFulfilled) => {
      return Promise.resolve({ data: null, error: null }).then(onFulfilled);
    });
  });

  it('should create a question successfully when authorized', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ user: { id: 'user-1' } });
    
    // 1. Check contributor check
    mockSupabase.then.mockImplementationOnce((onFulfilled) => {
      return Promise.resolve({ data: { id: 'user-1' }, error: null }).then(onFulfilled);
    });

    // 2. Insert call
    mockSupabase.then.mockImplementationOnce((onFulfilled) => {
      return Promise.resolve({ error: null }).then(onFulfilled);
    });

    const questionData = {
      question: 'What is 2+2?',
      options: ['3', '4', '5'],
      tags: ['math'],
      contributer: 'user-1',
      category_id: 1,
      answer: '4'
    };

    const result = await createQuestion(questionData);
    expect(result).toEqual({ status: 'success', message: 'Question created successfully' });
  });

  it('should fail if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ error: 'Auth error' });
    
    const result = await createQuestion({ contributer: 'user-1' } as any);
    expect(result.status).toBe('failed');
  });

  it('should fail if user is unauthorized (not the contributor)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ user: { id: 'user-2' } });
    
    mockSupabase.then.mockImplementationOnce((onFulfilled) => {
      return Promise.resolve({ data: { id: 'user-1' }, error: null }).then(onFulfilled);
    });

    const result = await createQuestion({ contributer: 'user-1' } as any);
    expect(result.status).toBe('failed');
    expect(result.reason).toBe('You do not have permission to create questions');
  });
});
