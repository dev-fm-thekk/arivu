import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignInAction, SingOutAction, getAuthenticatedUser } from './actions';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('Auth Actions', () => {
  const mockSupabase = {
    auth: {
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
    (cookies as any).mockResolvedValue({
      getAll: vi.fn(),
    });
  });

  it('SignInAction should call signInWithOAuth', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({ data: { url: 'http://redirect' }, error: null });
    const result = await SignInAction();
    expect(result.data).toBeDefined();
    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalled();
  });

  it('SingOutAction should call signOut', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
    const result = await SingOutAction();
    expect(result.message).toBe('signed out');
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it('getAuthenticatedUser should return user when logged in', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '123' } }, error: null });
    const result = await getAuthenticatedUser();
    expect(result.user).toEqual({ id: '123' });
  });

  it('getAuthenticatedUser should return error when not logged in', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') });
    const result = await getAuthenticatedUser();
    expect(result.error).toBeDefined();
  });
});
