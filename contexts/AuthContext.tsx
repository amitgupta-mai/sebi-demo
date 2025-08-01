import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import Cookies from 'js-cookie';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  walletAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    requiresVerification?: boolean;
    message?: string;
    user?: User;
  }>;
  signup: (
    data: SignupData
  ) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  sendOTP: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyEmail: (
    email: string,
    otp: string
  ) => Promise<{
    success: boolean;
    message?: string;
    user?: User;
    tokens?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    };
  }>;
  refreshToken: () => Promise<{ success: boolean; message?: string }>;
  getCurrentUser: () => Promise<{
    success: boolean;
    message?: string;
    user?: User;
  }>;
  isLoading: boolean;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get base URL for API calls
const getBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = Cookies.get('accessToken');
      const userData = Cookies.get('userData');

      if (accessToken && userData) {
        try {
          const user = JSON.parse(decodeURIComponent(userData));
          setUser(user);
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear invalid cookies
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          Cookies.remove('userData');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const sendOTP = async (
    email: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const baseUrl = getBaseUrl();

      const response = await fetch(
        `${baseUrl}/api/auth/send-verification-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          message: result.message || 'OTP sent successfully',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to send OTP',
        };
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (
    email: string,
    otp: string
  ): Promise<{
    success: boolean;
    message?: string;
    user?: User;
    tokens?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    };
  }> => {
    try {
      setIsLoading(true);
      const baseUrl = getBaseUrl();

      const response = await fetch(`${baseUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const { user: userData, tokens } = result.data;

        // Store tokens and user data in cookies
        Cookies.set('accessToken', tokens.accessToken, { expires: 7 });
        Cookies.set('refreshToken', tokens.refreshToken, { expires: 30 });
        Cookies.set('userData', encodeURIComponent(JSON.stringify(userData)), {
          expires: 7,
        });

        setUser(userData);
        return {
          success: true,
          message: result.message || 'Email verified successfully',
          user: userData,
          tokens,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Email verification failed',
        };
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    requiresVerification?: boolean;
    message?: string;
    user?: User;
  }> => {
    try {
      setIsLoading(true);
      const baseUrl = getBaseUrl();

      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Check if email verification is required
        if (result.data.requiresVerification) {
          return {
            success: false,
            requiresVerification: true,
            message:
              result.data.message ||
              'Please verify your email before logging in',
            user: result.data.user,
          };
        }

        const { user: userData, tokens } = result.data;

        // Store tokens and user data in cookies
        Cookies.set('accessToken', tokens.accessToken, { expires: 7 });
        Cookies.set('refreshToken', tokens.refreshToken, { expires: 30 });
        Cookies.set('userData', encodeURIComponent(JSON.stringify(userData)), {
          expires: 7,
        });

        setUser(userData);
        return {
          success: true,
          message: result.message || 'Login successful',
          user: userData,
        };
      } else {
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    data: SignupData
  ): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      setIsLoading(true);
      const baseUrl = getBaseUrl();

      const response = await fetch(`${baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          message:
            result.message ||
            'User registered successfully. Please verify your email.',
          user: result.data,
        };
      } else {
        return { success: false, message: result.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      const refreshTokenValue = Cookies.get('refreshToken');
      if (!refreshTokenValue) {
        return { success: false, message: 'No refresh token available' };
      }

      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const { tokens } = result.data;

        // Update tokens in cookies
        Cookies.set('accessToken', tokens.accessToken, { expires: 7 });
        Cookies.set('refreshToken', tokens.refreshToken, { expires: 30 });

        return {
          success: true,
          message: result.message || 'Token refreshed successfully',
        };
      } else {
        // Clear invalid tokens
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('userData');
        setUser(null);

        return {
          success: false,
          message: result.message || 'Token refresh failed',
        };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, message: 'Network error during token refresh' };
    }
  };

  const getCurrentUser = async (): Promise<{
    success: boolean;
    message?: string;
    user?: User;
  }> => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        return { success: false, message: 'No access token available' };
      }

      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        const userData = result.data;
        setUser(userData);
        Cookies.set('userData', encodeURIComponent(JSON.stringify(userData)), {
          expires: 7,
        });

        return {
          success: true,
          message: result.message || 'User retrieved successfully',
          user: userData,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to get current user',
        };
      }
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, message: 'Network error getting current user' };
    }
  };

  const logout = () => {
    const baseUrl = getBaseUrl();
    const accessToken = Cookies.get('accessToken');

    // Call logout endpoint
    if (accessToken) {
      fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch(console.error);
    }

    // Clear cookies
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('userData');

    // Clear user state
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    sendOTP,
    verifyEmail,
    refreshToken,
    getCurrentUser,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
