import { authFetch } from "./api-client";
import type { MultilingualText, WorkingHours } from "./business-api";

const API_BASE_URL = "https://api.blyss.uz";

// ============================================
// Types
// ============================================

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  availability_type: "flexible" | "fixed";
  working_hours: WorkingHours | null;
  is_open_now: boolean;
  service_price: number;
  service_duration_minutes: number;
}

export interface EmployeesForServiceResponse {
  service: {
    id: string;
    name: MultilingualText;
    price: number;
    duration_minutes: number;
  };
  employees: Employee[];
}

export interface TimeSlot {
  time: string; // "HH:mm"
  available_employees: string[]; // employee IDs
}

export interface AvailableSlotsResponse {
  date: string;
  business_open: boolean;
  service_duration_minutes?: number;
  slots: TimeSlot[];
  message?: string;
}

export interface AvailableSlotsParams {
  date: string; // "YYYY-MM-DD"
  service_id: string;
  employee_id?: string;
  duration_minutes?: number;
}

export interface BookingItem {
  service_id: string;
  service_name: MultilingualText;
  employee_id: string;
  employee_name: string;
  start_time: string; // "YYYY-MM-DDTHH:mm"
  price: number;
  duration_minutes: number;
}

export interface CreateBookingRequest {
  business_id: string;
  customer_name: string;
  customer_phone: string;
  customer_telegram_id?: number | null;
  booking_date: string; // "YYYY-MM-DD"
  notes?: string;
  items: BookingItem[];
}

export interface BookingItemResponse {
  id: string;
  booking_id: string;
  service_id: string;
  service_name: MultilingualText;
  employee_id: string;
  employee_name: string;
  start_time: string;
  end_time: string;
  price: number;
  duration_minutes: number;
  status: BookingStatus;
  order_index: number;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export interface BookingResponse {
  id: string;
  business_id: string;
  business_name: string;
  customer_name: string;
  customer_phone: string;
  customer_telegram_id: number | null;
  user_id: string | null;
  booking_date: string;
  status: BookingStatus;
  total_price: number;
  total_duration_minutes: number;
  notes: string;
  items: BookingItemResponse[];
  created_at: string;
}

export interface BookingsListResponse {
  data: BookingResponse[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface GetBookingsParams {
  page?: number;
  page_size?: number;
  status?: BookingStatus;
  date_from?: string;
  date_to?: string;
  employee_id?: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Get employees who offer a specific service
 * GET /public/businesses/:businessId/services/:serviceId/employees
 */
export async function getEmployeesForService(
  businessId: string,
  serviceId: string,
  date?: string
): Promise<EmployeesForServiceResponse> {
  const params = date ? `?date=${date}` : "";
  const response = await authFetch(
    `${API_BASE_URL}/public/businesses/${businessId}/services/${serviceId}/employees${params}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch employees for service: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get available time slots for a service/employee on a specific date
 * GET /public/businesses/:businessId/available-slots
 */
export async function getAvailableSlots(
  businessId: string,
  params: AvailableSlotsParams
): Promise<AvailableSlotsResponse> {
  const queryParams = new URLSearchParams({
    date: params.date,
    service_id: params.service_id,
  });

  if (params.employee_id) {
    queryParams.append("employee_id", params.employee_id);
  }

  if (params.duration_minutes) {
    queryParams.append("duration_minutes", params.duration_minutes.toString());
  }

  const response = await authFetch(
    `${API_BASE_URL}/public/businesses/${businessId}/available-slots?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch available slots: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new booking
 * POST /public/businesses/:businessId/bookings
 */
export async function createBooking(
  businessId: string,
  bookingData: CreateBookingRequest
): Promise<BookingResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/public/businesses/${businessId}/bookings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create booking: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get current user's bookings
 * GET /users/me/bookings
 */
export async function getUserBookings(
  params?: GetBookingsParams
): Promise<BookingsListResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
  if (params?.status) queryParams.append("status", params.status);
  if (params?.date_from) queryParams.append("date_from", params.date_from);
  if (params?.date_to) queryParams.append("date_to", params.date_to);

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/users/me/bookings${queryString ? `?${queryString}` : ""}`;

  const response = await authFetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch user bookings: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Cancel a booking
 * PATCH /users/me/bookings/:bookingId/cancel
 */
export async function cancelBooking(bookingId: string): Promise<{ id: string; status: string; updated_at: string }> {
  const response = await authFetch(
    `${API_BASE_URL}/users/me/bookings/${bookingId}/cancel`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to cancel booking: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a specific booking by ID (requires authentication)
 * GET /businesses/:businessId/bookings/:bookingId
 */
export async function getBookingById(
  businessId: string,
  bookingId: string
): Promise<BookingResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/businesses/${businessId}/bookings/${bookingId}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch booking: ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// Helper Functions
// ============================================

/**
 * Format time string "HH:mm" to display format "H:MM"
 */
export function formatTimeSlot(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Get the full name of an employee
 */
export function getEmployeeFullName(employee: Employee): string {
  return `${employee.first_name} ${employee.last_name}`.trim() || "Unknown";
}

/**
 * Calculate end time given start time and duration
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [datePart, timePart] = startTime.split("T");
  const [hours, minutes] = timePart.split(":").map(Number);

  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;

  return `${datePart}T${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateToAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format price with thousand separators
 */
export function formatPrice(price: number): string {
  return price.toLocaleString("uz-UZ");
}
