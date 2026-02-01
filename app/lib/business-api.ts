import { authFetch } from "./api-client";

const API_BASE_URL = "https://api.blyss.uz";

// ============================================
// Types
// ============================================

export interface MultilingualText {
  uz: string;
  ru: string;
}

export interface DayWorkingHours {
  start: number; // seconds from midnight (e.g., 32400 = 9:00 AM)
  end: number; // seconds from midnight (e.g., 72000 = 8:00 PM)
  is_open: boolean;
}

export interface WorkingHours {
  monday: DayWorkingHours;
  tuesday: DayWorkingHours;
  wednesday: DayWorkingHours;
  thursday: DayWorkingHours;
  friday: DayWorkingHours;
  saturday: DayWorkingHours;
  sunday: DayWorkingHours;
}

export interface BusinessLocation {
  lat: number;
  lng: number;
  display_address?: string;
  country?: string;
  region?: string;
  city?: string;
  street_name?: string;
}

export interface BusinessService {
  id: string;
  name: MultilingualText;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

// Service in nearest businesses response (minimal info)
export interface NearestBusinessService {
  name?: MultilingualText;
}

// Business from nearest endpoint
export interface NearestBusiness {
  business_id?: string;
  business_name?: string;
  business_type?: string;
  location?: BusinessLocation;
  working_hours?: WorkingHours | null;
  avatar_url?: string;
  distance?: number;
  distance_metric?: "m" | "km";
  services?: NearestBusinessService[];
}

// Full business details
export interface Business {
  id: string;
  business_name: string;
  business_type: string;
  location: BusinessLocation;
  working_hours: WorkingHours;
  business_phone_number: string;
  business_owner_id: string;
  business_status: string;
  tenant_url: string;
  employee_invite_token: string;
  date_created: string;
  avatar_url?: string;
  avatar_updated_at?: string;
  distance: number; // in km
  services: BusinessService[];
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface NearestBusinessesResponse {
  data: NearestBusiness[];
  pagination: Pagination;
}

export interface NearestBusinessesParams {
  lat: number;
  lng: number;
  radius?: number; // radius in km, default probably 10
  page?: number;
  page_size?: number;
}

// ============================================
// API Functions
// ============================================

/**
 * Get nearest businesses based on location
 * GET /businesses/nearest
 */
export async function getNearestBusinesses(
  params: NearestBusinessesParams
): Promise<NearestBusinessesResponse> {
  const { lat, lng, radius = 10, page = 1, page_size = 20 } = params;

  const queryParams = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radius: radius.toString(),
    page: page.toString(),
    page_size: page_size.toString(),
  });

  const response = await authFetch(
    `${API_BASE_URL}/public/businesses/nearest?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch businesses: ${response.statusText}`);
  }

  return response.json();
}

export interface DistanceParams {
  userLocation: { lat: number; lng: number };
  businessLocation: { lat: number; lng: number };
}

export interface DistanceResponse {
  distance: number;
  metric: "m" | "km";
  duration?: number; // in seconds (optional)
}

/**
 * Get accurate distance between user and business
 * GET /distance
 */
export async function getDistance(
  params: DistanceParams
): Promise<DistanceResponse> {
  const queryParams = new URLSearchParams({
    "user_location[lat]": params.userLocation.lat.toString(),
    "user_location[lng]": params.userLocation.lng.toString(),
    "business_location[lat]": params.businessLocation.lat.toString(),
    "business_location[lng]": params.businessLocation.lng.toString(),
  });

  const response = await authFetch(
    `${API_BASE_URL}/distance?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to get distance: ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// Helper Functions
// ============================================

/**
 * Convert seconds from midnight to time string (e.g., 32400 -> "9:00 AM")
 */
export function secondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Check if business is currently open
 */
export function isCurrentlyOpen(workingHours: WorkingHours): boolean {
  const now = new Date();
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDay = dayNames[now.getDay()] as keyof WorkingHours;

  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const dayHours = workingHours[currentDay];

  return dayHours.is_open && currentSeconds >= dayHours.start && currentSeconds <= dayHours.end;
}

// ============================================
// Business Details API
// ============================================

export interface BusinessDetailsService {
  id?: string;
  name?: MultilingualText;
  description?: MultilingualText;
  price?: number;
  duration_minutes?: number;
}

export interface BusinessDetailsResponse {
  business_id?: string;
  business_name?: string;
  business_location?: BusinessLocation;
  avatar_url?: string;
  business_type?: string;
  working_hours?: WorkingHours | null;
  business_phone_number?: string;
  tenant_url?: string;
  services?: BusinessDetailsService[];
}

/**
 * Get business details with services
 * GET /public/businesses/:businessId/details
 */
export async function getBusinessDetails(
  businessId: string
): Promise<BusinessDetailsResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/public/businesses/${businessId}/details`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch business details: ${response.statusText}`);
  }

  return response.json();
}
