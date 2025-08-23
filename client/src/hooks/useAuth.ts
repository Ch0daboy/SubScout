import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase.js';
import type { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      setUser({
        id: authUser.id,
        email: profile?.email || authUser.email,
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        profileImageUrl: profile?.profile_image_url,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to auth user data
      setUser({
        id: authUser.id,
        email: authUser.email || null,
        firstName: null,
        lastName: null,
        profileImageUrl: null,
      });
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    signOut,
  };
}
