// API Response Types
export interface ApiResponse<T = any> {
  responseCode: string;
  responseMessage: string;
  data: T;
}

// Auth Types
export interface LoginRequest {
  officialMail: string;
  password: string;
}

export interface LoginResponse {
  jwtToken: string;
  refreshToken: string | null;
  message: string;
}

export interface SignUpRequest {
  fullName: string;
  officialMail: string;
  password: string;
  phoneNumber: string;
}

export interface ConfirmOTPRequest {
  officialMail: string;
  otp: string;
  fullName: string;
  phoneNumber: string;
  password: string;
}

// Visitor Types
export interface Visitor {
  visitorId: number;
  dateCreated: string;
  tagNumber: string;
  name: string;
  organisation: string;
  mobileNumber: string;
  whomToSee: string;
  purposeOfVisit: string;
  timeIn: string;
  signIn: string;
  timeOut: string | null;
  signOut: string | null;
  createdByUserId: number;
}

export interface AddVisitorRequest {
  tagNumber: string;
  name: string;
  organisation: string;
  mobileNumber: string;
  whomToSee: string;
  purposeOfVisit: string;
  signIn: string;
}

export interface SignOutVisitorRequest {
  visitorId: number;
  signOut: string;
}
