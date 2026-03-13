// Token Manager
// Manages JWT tokens in localStorage with proper JWT decoding

import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const EXPIRATION_BUFFER = 60; // 60 seconds buffer before token expiration

interface JwtPayload {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

class TokenManager {
  /**
   * Retrieves the auth token from localStorage
   * @returns The auth token or null if not found
   */
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Stores auth token in localStorage
   * @param token - The JWT token
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Retrieves the cached user object from localStorage
   * @returns The User object or null if not found
   */
  getUser(): any | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Stores the user object in localStorage
   * @param user - The User object
   */
  setUser(user: any): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Removes token and user from localStorage
   */
  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Checks if a token is expired or will expire within the buffer time
   * @param token - The JWT token to check
   * @returns True if token is expired or will expire soon, false otherwise
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);

      if (!decoded || !decoded.exp) {
        console.warn('[TokenManager] Token does not have an exp claim or is not a JWT. Assuming expired.');
        return true;
      }

      // Check if token expires within buffer time (60 seconds)
      const now = Math.floor(Date.now() / 1000);
      const isExpired = decoded.exp - now < EXPIRATION_BUFFER;
      if (isExpired) {
        console.warn('[TokenManager] Token is expired according to exp claim.');
      }
      return isExpired;
    } catch {
      console.warn('[TokenManager] Exception while checking token expiration, assuming expired.');
      return true;
    }
  }

  /**
   * Decodes a JWT token to extract its payload
   * @param token - The JWT token to decode
   * @returns The decoded token payload or null if decoding fails
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }
}

export const tokenManager = new TokenManager();
