import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useUserStore } from "~/stores/user-store";

const API_BASE_URL = "https://api.blyss.uz";

/**
 * Get HMAC signature from server-side API
 */
async function getHmacSignature(body: string, timestamp: string): Promise<string> {
  const response = await fetch("/api/generate-hmac", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body, timestamp }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate HMAC signature");
  }

  const data = await response.json();
  return data.signature;
}

/**
 * Axios instance with authorization header support
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to add authorization header and HMAC signature
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add access_token from store to authorization header
    const access_token = useUserStore.getState().access_token;
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }

    // Add HMAC signature
    const timestamp = Math.floor(Date.now() / 1000).toString();
    // For FormData (file uploads), use empty string
    const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
    const body = isFormData ? "" : config.data ? JSON.stringify(config.data) : "";

    // For FormData, delete Content-Type header so Axios sets it with correct boundary
    if (isFormData) {
      delete config.headers["Content-Type"];
    }

    try {
      const signature = await getHmacSignature(body, timestamp);
      config.headers["X-Timestamp"] = timestamp;
      config.headers["X-Signature"] = signature;
    } catch (error) {
      console.error("Failed to get HMAC signature:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle token refresh
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as {
      _retry?: boolean;
      headers?: { Authorization?: string };
    } & typeof error.config;

    // If 401 and not already retried, try to refresh token
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refresh_token = useUserStore.getState().refresh_token;

      if (refresh_token) {
        try {
          // Build headers with HMAC signature for refresh request
          const refreshHeaders: Record<string, string> = {
            Authorization: `Bearer ${refresh_token}`,
          };

          try {
            const timestamp = Math.floor(Date.now() / 1000).toString();
            const body = "{}";
            const signature = await getHmacSignature(body, timestamp);
            refreshHeaders["X-Timestamp"] = timestamp;
            refreshHeaders["X-Signature"] = signature;
          } catch (error) {
            console.error("Failed to get HMAC signature for refresh:", error);
          }

          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: refreshHeaders,
            }
          );

          const { access_token, refresh_token: new_refresh_token, expires_at } =
            response.data;

          // Update tokens in store
          useUserStore
            .getState()
            .setTokens(access_token, new_refresh_token, expires_at);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear user and redirect to login
          useUserStore.getState().clearUser();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Authenticated fetch wrapper - adds Authorization header and HMAC signature from store
 * Use this for fetch calls that need authentication
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const access_token = useUserStore.getState().access_token;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type to application/json if body is not FormData
  // FormData automatically sets Content-Type with boundary
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Add Authorization header if token exists
  if (access_token) {
    headers["Authorization"] = `Bearer ${access_token}`;
  }

  // Add HMAC signature
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = options.body instanceof FormData ? "" : ((options.body as string) || "");
    const signature = await getHmacSignature(body, timestamp);
    headers["X-Timestamp"] = timestamp;
    headers["X-Signature"] = signature;
  } catch (error) {
    console.error("Failed to get HMAC signature:", error);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * API functions for authentication
 */

export interface SendOtpRequest {
  phone_number: string;
  user_type: "user" | "business_owner";
}

export interface SendOtpResponse {
  message: string;
  sms_sent: boolean;
}

export interface SendOtpError {
  error: string;
  error_code: "VALIDATION_ERROR" | "RATE_LIMIT_EXCEEDED" | "INTERNAL_ERROR";
}

export async function sendOtp(
  data: SendOtpRequest
): Promise<{ data?: SendOtpResponse; error?: SendOtpError }> {
  try {
    const response = await apiClient.post<SendOtpResponse>(
      "/auth/send-otp",
      data
    );
    return { data: response.data };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return { error: err.response.data as SendOtpError };
    }
    throw err;
  }
}

export interface VerifyOtpRequest {
  phone_number: string;
  otp_code: number;
}

export interface VerifyOtpResponse {
  message: string;
  otp_id: string;
}

export interface VerifyOtpError {
  error: string;
  error_code: "INVALID_OTP" | "OTP_EXPIRED" | "INTERNAL_ERROR";
}

export async function verifyOtp(
  data: VerifyOtpRequest
): Promise<{ data?: VerifyOtpResponse; error?: VerifyOtpError }> {
  try {
    const response = await apiClient.post<VerifyOtpResponse>(
      "/auth/verify-otp",
      {
        ...data,
        user_type: 'user'
      }
    );
    return { data: response.data };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return { error: err.response.data as VerifyOtpError };
    }
    throw err;
  }
}

export interface RegisterRequest {
  otp_id: string;
  user_type: "user" | "business_owner";
  first_name: string;
  last_name: string;
  telegram_id: number | null;
}

export interface RegisterResponse {
  id: string;
  user_type: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  telegram_id: number;
  is_verified: boolean;
  created_at: string;
}

export interface RegisterError {
  error: string;
  error_code:
  | "OTP_NOT_FOUND"
  | "OTP_NOT_VERIFIED"
  | "OTP_ALREADY_USED"
  | "PHONE_EXISTS"
  | "INTERNAL_ERROR";
}

export async function registerUser(
  data: RegisterRequest
): Promise<{ data?: RegisterResponse; error?: RegisterError }> {
  try {
    const response = await apiClient.post<RegisterResponse>(
      "/auth/register",
      data
    );
    return { data: response.data };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return { error: err.response.data as RegisterError };
    }
    throw err;
  }
}

export interface LoginRequest {
  otp_id: string;
  phone_number: string;
  user_type: "user" | "business_owner";
}

export interface LoginResponse {
  user: {
    id: string;
    user_type: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    telegram_id: number;
    is_verified: boolean;
    created_at: string;
  };
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface LoginError {
  error: string;
  error_code:
  | "OTP_NOT_FOUND"
  | "OTP_NOT_VERIFIED"
  | "OTP_ALREADY_USED"
  | "USER_NOT_FOUND"
  | "INTERNAL_ERROR";
}

export async function login(
  data: LoginRequest
): Promise<{ data?: LoginResponse; error?: LoginError }> {
  try {
    const response = await apiClient.post<LoginResponse>("/auth/login", data, {
      // Important: include credentials for cookies
      withCredentials: true,
    });
    return { data: response.data };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return { error: err.response.data as LoginError };
    }
    throw err;
  }
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface RefreshTokenError {
  error: string;
  error_code: "NO_REFRESH_TOKEN" | "INVALID_REFRESH_TOKEN" | "INTERNAL_ERROR";
}

export async function refreshToken(): Promise<{
  data?: RefreshTokenResponse;
  error?: RefreshTokenError;
}> {
  try {
    const response = await apiClient.post<RefreshTokenResponse>(
      "/auth/refresh",
      {},
      {
        withCredentials: true,
      }
    );
    return { data: response.data };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return { error: err.response.data as RefreshTokenError };
    }
    throw err;
  }
}

export interface MeResponse {
  id: string;
  user_type: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  telegram_id: number;
  is_verified: boolean;
  created_at: string;
}

export interface MeError {
  error: string;
  error_code: "NO_TOKEN" | "INVALID_TOKEN" | "INTERNAL_ERROR";
}

export async function getCurrentUser(): Promise<{
  data?: MeResponse;
  error?: MeError;
}> {
  try {
    const response = await apiClient.get<MeResponse>("/auth/me", {
      withCredentials: true,
    });
    return { data: response.data };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return { error: err.response.data as MeError };
    }
    throw err;
  }
}

export interface LogoutResponse {
  message: string;
}

export interface LogoutError {
  error: string;
  error_code: "NO_TOKEN" | "INVALID_TOKEN" | "INTERNAL_ERROR";
}

export async function logout(): Promise<{
  data?: LogoutResponse;
  error?: LogoutError;
}> {
  try {
    const response = await apiClient.post<LogoutResponse>(
      "/auth/logout",
      {},
      {
        withCredentials: true,
      }
    );
    return { data: response.data };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return { error: err.response.data as LogoutError };
    }
    throw err;
  }
}
