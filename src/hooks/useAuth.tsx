import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  token?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (phone: string, password: string) => Promise<{ error?: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (phone: string, password: string) => {
    try {
      setLoading(true);

      const response = await fetch('https://back-end-for-xirfadsan.onrender.com/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
        return { error: data.message || 'Login failed' };
      }

      // ✅ Assuming your backend returns something like { user: {...}, token: "..." }
      const loggedInUser: AuthUser = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        token: data.token,
      };

      // Save user + token to localStorage
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      toast({
        title: "Welcome!",
        description: "You have successfully signed in.",
      });

      return { error: null };
    } catch (err) {
      console.error('Error logging in:', err);
      toast({
        title: "Error",
        description: "Something went wrong while logging in.",
        variant: "destructive",
      });
      return { error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('user');
      setUser(null);

      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "There was an error signing out.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};