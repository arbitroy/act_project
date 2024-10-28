'use client'
import { useState, useEffect } from 'react';

export interface User {
    id: number;
    username: string;
    role: string;
}

interface AuthResponse {
    authenticated: boolean;
    user?: User;
    message?: string;
}

interface AuthError {
    message: string;
    status?: number;
}

export interface UseAuthReturn {
    user: User | null;
    loading: boolean;
    error: AuthError | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AuthError | null>(null);

    const handleAuthError = (error: unknown, context: string) => {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        console.error(`${context}:`, error);
        setError({ message: errorMessage });
        setUser(null);
    };

    const clearError = () => setError(null);

    const login = async (username: string, password: string) => {
        setLoading(true);
        clearError();
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            setUser(data.user);
        } catch (error) {
            handleAuthError(error, 'Login error');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        clearError();

        try {
            const response = await fetch('/api/auth/logout', { 
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Logout failed');
            }

            setUser(null);
        } catch (error) {
            handleAuthError(error, 'Logout error');
        } finally {
            setLoading(false);
        }
    };

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/check', {
                credentials: 'include'
            });

            const data: AuthResponse = await response.json();

            // No error throwing for unauthenticated state
            if (data.authenticated && data.user) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            // Only log actual errors, not unauthenticated states
            if (error instanceof Error && error.message !== 'No active session') {
                console.error('Auth check error:', error);
            }
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            if (mounted) {
                await checkAuth();
            }
        };

        initializeAuth();

        return () => {
            mounted = false;
        };
    }, []);

    return {
        user,
        loading,
        error,
        login,
        logout,
        checkAuth,
    };
}