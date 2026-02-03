import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "~/components/AppLayout";
import { AuthDialog } from "~/components/AuthDialog";
import { useUserStore, isAuthenticated } from "~/stores/user-store";
import {
  getUserBookings,
  cancelBooking,
  formatPrice,
  type BookingResponse,
  type BookingStatus,
} from "~/lib/booking-api";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock4,
  Ban,
} from "lucide-react";
import { Button, Spinner } from "@heroui/react";
import type { Route } from "./+types/orders";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Buyurtmalarim - Blyss" },
    { name: "description", content: "Sizning buyurtmalaringiz" },
  ];
}

type FilterStatus = "all" | BookingStatus;

const statusConfig: Record<
  BookingStatus,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Kutilmoqda",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    icon: <Clock4 size={14} />,
  },
  confirmed: {
    label: "Tasdiqlangan",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: <CheckCircle2 size={14} />,
  },
  completed: {
    label: "Bajarilgan",
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: <CheckCircle2 size={14} />,
  },
  cancelled: {
    label: "Bekor qilingan",
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: <XCircle size={14} />,
  },
  no_show: {
    label: "Kelmadi",
    color: "text-stone-600",
    bgColor: "bg-stone-100",
    icon: <Ban size={14} />,
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "long",
  };
  return date.toLocaleDateString("uz-UZ", options);
}

function formatTime(timeString: string): string {
  // timeString is "YYYY-MM-DDTHH:mm"
  const timePart = timeString.split("T")[1];
  if (!timePart) return "";
  return timePart;
}

function getServiceName(serviceName: { uz: string; ru: string } | string): string {
  if (typeof serviceName === "string") return serviceName;
  return serviceName.uz || serviceName.ru || "Xizmat";
}

export default function Orders() {
  const navigate = useNavigate();
  const { access_token } = useUserStore();

  // Auth state
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Data state
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // Cancel state
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated(access_token)) {
      setIsAuthDialogOpen(true);
    }
    setHasCheckedAuth(true);
  }, [access_token]);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated(access_token)) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getUserBookings({ page_size: 50 });
      setBookings(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  }, [access_token]);

  // Fetch on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated(access_token)) {
      fetchBookings();
    }
  }, [access_token, fetchBookings]);

  // Handle auth success
  const handleAuthSuccess = () => {
    setIsAuthDialogOpen(false);
    fetchBookings();
  };

  // Handle auth close (user dismissed dialog without logging in)
  const handleAuthClose = () => {
    setIsAuthDialogOpen(false);
    // Navigate back if user doesn't want to log in
    if (!isAuthenticated(access_token)) {
      navigate(-1);
    }
  };

  // Handle cancel booking
  const handleCancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    setCancelError(null);

    try {
      await cancelBooking(bookingId);
      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled" as BookingStatus } : b
        )
      );
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Bekor qilishda xatolik");
    } finally {
      setCancellingId(null);
    }
  };

  // Filter bookings
  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  // Group bookings by date
  const groupedBookings = filteredBookings.reduce(
    (acc, booking) => {
      const date = booking.booking_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(booking);
      return acc;
    },
    {} as Record<string, BookingResponse[]>
  );

  // Sort dates (newest first)
  const sortedDates = Object.keys(groupedBookings).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Show loading while checking auth
  if (!hasCheckedAuth) {
    return (
      <AppLayout back>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" color="current" />
        </div>
      </AppLayout>
    );
  }

  // Show auth dialog if not authenticated
  if (!isAuthenticated(access_token)) {
    return (
      <AppLayout back>
        <div className="flex flex-col items-center justify-center h-64 px-4">
          <p className="text-stone-500 text-center mb-4">
            Buyurtmalaringizni ko'rish uchun tizimga kiring
          </p>
          <Button
            className="bg-primary text-white"
            onPress={() => setIsAuthDialogOpen(true)}
          >
            Kirish
          </Button>
        </div>
        <AuthDialog
          isOpen={isAuthDialogOpen}
          onClose={handleAuthClose}
          onSuccess={handleAuthSuccess}
          title="Kirish"
          subtitle="Buyurtmalaringizni ko'rish uchun telefon raqamingizni kiriting"
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout back>
      <div className="px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            Buyurtmalarim
          </h1>
          <button
            onClick={fetchBookings}
            disabled={isLoading}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={20}
              className={`text-stone-500 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {[
            { key: "all" as FilterStatus, label: "Hammasi" },
            { key: "pending" as FilterStatus, label: "Kutilmoqda" },
            { key: "confirmed" as FilterStatus, label: "Tasdiqlangan" },
            { key: "completed" as FilterStatus, label: "Bajarilgan" },
            { key: "cancelled" as FilterStatus, label: "Bekor qilingan" },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === filter.key
                  ? "bg-primary text-white"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl mb-4">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Cancel Error */}
        {cancelError && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl mb-4">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-red-600 dark:text-red-400 text-sm">{cancelError}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" color="current" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredBookings.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Calendar size={48} className="text-stone-300 mb-4" />
            <p className="text-stone-500 dark:text-stone-400">
              {filterStatus === "all"
                ? "Sizda hali buyurtmalar yo'q"
                : "Bu statusda buyurtmalar yo'q"}
            </p>
            <Button
              className="mt-4 bg-primary text-white"
              onPress={() => navigate("/")}
            >
              Xizmat tanlash
            </Button>
          </div>
        )}

        {/* Bookings List */}
        {!isLoading && sortedDates.length > 0 && (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date}>
                {/* Date Header */}
                <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-3">
                  {formatDate(date)}
                </h2>

                {/* Bookings for this date */}
                <div className="space-y-3">
                  {groupedBookings[date].map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onCancel={() => handleCancelBooking(booking.id)}
                      isCancelling={cancellingId === booking.id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
        title="Kirish"
        subtitle="Buyurtmalaringizni ko'rish uchun telefon raqamingizni kiriting"
      />
    </AppLayout>
  );
}

// Booking Card Component
interface BookingCardProps {
  booking: BookingResponse;
  onCancel: () => void;
  isCancelling: boolean;
}

function BookingCard({ booking, onCancel, isCancelling }: BookingCardProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const status = statusConfig[booking.status];
  const canCancel = booking.status === "pending" || booking.status === "confirmed";

  // Get first item's time for display
  const firstItem = booking.items[0];
  const startTime = firstItem ? formatTime(firstItem.start_time) : "";
  const endTime = firstItem ? formatTime(firstItem.end_time) : "";

  return (
    <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-stone-100 dark:border-stone-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">
              {booking.business_name}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-stone-500">
              <Clock size={14} />
              <span>
                {startTime} - {endTime}
              </span>
            </div>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
          >
            {status.icon}
            {status.label}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="p-4 space-y-2">
        {booking.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex-1">
              <p className="text-stone-900 dark:text-stone-100">
                {getServiceName(item.service_name)}
              </p>
              <p className="text-stone-500 text-xs">
                {item.employee_name} • {item.duration_minutes} daqiqa
              </p>
            </div>
            <p className="font-medium text-stone-900 dark:text-stone-100">
              {formatPrice(item.price)} so'm
            </p>
          </div>
        ))}

        {/* Total */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-700">
          <span className="text-sm text-stone-500">Jami</span>
          <span className="font-semibold text-stone-900 dark:text-stone-100">
            {formatPrice(booking.total_price)} so'm
          </span>
        </div>
      </div>

      {/* Actions */}
      {canCancel && (
        <div className="px-4 pb-4">
          {!showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="w-full py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-stone-600 dark:text-stone-400 text-center">
                Buyurtmani bekor qilmoqchimisiz?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={isCancelling}
                  className="flex-1 py-2 text-sm text-stone-600 bg-stone-100 dark:bg-stone-700 rounded-xl disabled:opacity-50"
                >
                  Yo'q
                </button>
                <button
                  onClick={onCancel}
                  disabled={isCancelling}
                  className="flex-1 py-2 text-sm text-white bg-red-500 rounded-xl disabled:opacity-50 flex items-center justify-center"
                >
                  {isCancelling ? (
                    <Spinner size="sm" color="current" />
                  ) : (
                    "Ha, bekor qilish"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {booking.notes && (
        <div className="px-4 pb-4">
          <p className="text-xs text-stone-500 italic">"{booking.notes}"</p>
        </div>
      )}
    </div>
  );
}
