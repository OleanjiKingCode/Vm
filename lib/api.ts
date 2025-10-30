import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  ConfirmOTPRequest,
  Visitor,
  AddVisitorRequest,
  SignOutVisitorRequest,
} from "./types";

// Base API URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://test.xpresspayments.com:9993/api";

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("jwtToken");
  }
  return null;
};

// Helper function to handle API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}

// Auth APIs
export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiCall<LoginResponse>("/Auth/Login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  signUp: async (data: SignUpRequest): Promise<ApiResponse<null>> => {
    return apiCall<null>("/Auth/SignUp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  confirmOTP: async (data: ConfirmOTPRequest): Promise<ApiResponse<null>> => {
    return apiCall<null>("/Auth/ConfirmOTPAndRegister", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// Visitor APIs
export const visitorApi = {
  getAll: async (): Promise<ApiResponse<Visitor[]>> => {
    return apiCall<Visitor[]>("/Visitor/GetAllVisitors", {
      method: "GET",
    });
  },

  getById: async (visitorId: number): Promise<ApiResponse<Visitor>> => {
    return apiCall<Visitor>(`/Visitor/GetVisitorByID?visitorId=${visitorId}`, {
      method: "GET",
    });
  },

  add: async (data: AddVisitorRequest): Promise<ApiResponse<null>> => {
    return apiCall<null>("/Visitor/AddVisitor", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  signOut: async (
    vistorId: number,
    signOut: string
  ): Promise<ApiResponse<null>> => {
    return apiCall<null>(
      `/Visitor/SignOutVisitor?vistorId=${vistorId}&SignOut=${signOut}`,
      {
        method: "POST",
      }
    );
  },
};
