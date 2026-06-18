import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCategory, editCategory, deleteCategory, fetchCategory } from './action';
import { createClient } from '@/src/utils/supabase/server';
import { cookies } from 'next/headers';

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('Category Actions', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
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

  it('should create a category successfully', async () => {
    mockSupabase.then.mockImplementationOnce((onFulfilled) => {
      return Promise.resolve({ error: null }).then(onFulfilled);
    });
    const result = await createCategory({ name: 'Test', slug: 'test' });
    expect(result).toEqual({ status: 'success', message: 'Created Category' });
  });

  it('should handle error when creating a category', async () => {
    mockSupabase.then.mockImplementationOnce((onFulfilled) => {
      return Promise.resolve({ error: { message: 'Database error' } }).then(onFulfilled);
    });
    const result = await createCategory({ name: 'Test', slug: 'test' });
    expect(result).toHaveProperty('err');
  });

  it('should edit a category successfully', async () => {
    mockSupabase.then.mockImplementationOnce((onFulfilled) => {
      return Promise.resolve({ error: null }).then(onFulfilled);
    });
    const result = await editCategory(1, { name: 'Updated', slug: 'updated' });
    expect(result).toEqual({ status: 'success', message: 'Updated category' });
  });

  it('should delete a category successfully', async () => {
    mockSupabase.then.mockImplementationOnce((onFulfilled) => {
      return Promise.resolve({ error: null }).then(onFulfilled);
    });
    const result = await deleteCategory(1);
    expect(result).toEqual({ status: 'success', message: 'Delete category' });
  });

  it('should fetch categories with default options', async () => {
    mockSupabase.then.mockImplementationOnce((onFulfilled) => {
      return Promise.resolve({ data: [{ id: 1, name: 'Cat' }], error: null }).then(onFulfilled);
    });
    const result = await fetchCategory();
    expect(result.data).toEqual([{ id: 1, name: 'Cat' }]);
  });
});
