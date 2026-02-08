// Auth utilities for managing tokens and user state

// Store tokens in localStorage
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

// Get access token
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Get refresh token
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

// // Remove tokens
// export const removeTokens = () => {
//   localStorage.removeItem('access_token');
//   localStorage.removeItem('refresh_token');
// };

// // Check if user is authenticated
// export const isAuthenticated = (): boolean => {
//   const token = getAccessToken();
//   return !!token;
// };
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('access_token');
};

export const removeTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Decode JWT token to get expiration time
export const getTokenExpirationDate = (token: string): Date | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) {
      return null;
    }
    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(payload.exp);
    return expirationDate;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) {
    return true;
  }
  const expirationDate = getTokenExpirationDate(token);
  if (!expirationDate) {
    return true;
  }
  return new Date() > expirationDate;
};

// Check if user session is valid
export const isSessionValid = (): boolean => {
  const token = getAccessToken();
  return !isTokenExpired(token);
};