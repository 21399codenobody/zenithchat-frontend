export const getStoredToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('zenith_token');
    }
    return null;
};


export const setStoredToken = (token: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('zenith_token', token);
    }
};


export const getStoredUser = (): any | null => {
    if (typeof window !== 'undefined') {
        const user = localStorage.getItem('zenith_user');
        return user ? JSON.parse(user) : null;
    }
    return null;
};


export const setStoredUser = (user: any): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('zenith_user', JSON.stringify(user));
    }
};


export const clearStoredAuth = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('zenith_token');
        localStorage.removeItem('zenith_user');
    }
};