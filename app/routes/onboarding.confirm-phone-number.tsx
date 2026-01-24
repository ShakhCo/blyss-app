import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { hapticFeedback, popup, useLaunchParams } from "@tma.js/sdk-react";
import { verifyOtp, sendOtp, login, registerUser } from "~/lib/api-client";
import { useOnboardingStore } from "~/stores/onboarding-store";
import { useUserStore } from "~/stores/user-store";
import { SafeAreaLayout } from "~/components/SafeAreaLayout";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "~/components/Button";

function triggerErrorHaptic() {
  if (hapticFeedback.notificationOccurred.isAvailable()) {
    hapticFeedback.notificationOccurred("error");
  }
}

function triggerSuccessHaptic() {
  if (hapticFeedback.notificationOccurred.isAvailable()) {
    hapticFeedback.notificationOccurred("success");
  }
}

function showErrorPopup(message: string) {
  triggerErrorHaptic();
  if (popup.show.isAvailable()) {
    popup.show({
      title: "Xatolik",
      message,
      buttons: [{ id: "ok", type: "ok" }],
    });
  }
}

export function meta() {
  return [{ title: "Tasdiqlash - BLYSS" }];
}

export default function OnboardingConfirmPhoneNumber() {
  const navigate = useNavigate();
  const { data, setData } = useOnboardingStore();
  const { setUser, setTokens } = useUserStore();
  const launchParams = useLaunchParams();

  // Get Telegram user data for pre-filling
  const tgUser = launchParams.tgWebAppData?.user;
  const telegramId = tgUser?.id;
  const initialFirstName = typeof tgUser?.first_name === "string" ? tgUser.first_name : "";
  const initialLastName = typeof tgUser?.last_name === "string" ? tgUser.last_name : "";

  const [otp, setOtp] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [shake, setShake] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [registerShake, setRegisterShake] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const isVerifyingRef = useRef(false);
  const savedOtpIdRef = useRef<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Store phone number locally to prevent loss if onboarding store is cleared
  const phoneNumberRef = useRef<string | null>(data?.phone_number ?? null);

  // Update phone number ref when data changes
  useEffect(() => {
    if (data?.phone_number) {
      phoneNumberRef.current = data.phone_number;
    }
  }, [data?.phone_number]);

  // Redirect to login on mount if no data and no locally stored phone number
  useEffect(() => {
    if (!data && !phoneNumberRef.current) {
      navigate("/login", { replace: true });
    }
  }, []);

  // Auto-focus first input on mount
  useEffect(() => {
    if (!isLoggingIn && !isSuccess && !showRegister) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isLoggingIn, showRegister]);

  const triggerShakeOnly = useCallback(() => {
    triggerErrorHaptic();
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const triggerRegisterShakeOnly = useCallback(() => {
    triggerErrorHaptic();
    setRegisterShake(true);
    setTimeout(() => setRegisterShake(false), 500);
  }, []);

  const handleVerifyOtp = async (otpCode: string) => {
    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;

    const phoneNumber = phoneNumberRef.current;
    if (!phoneNumber) {
      triggerErrorHaptic();
      isVerifyingRef.current = false;
      return;
    }

    // Step 1: Verify OTP to get otp_id
    const verifyResult = await verifyOtp({
      phone_number: phoneNumber,
      otp_code: parseInt(otpCode, 10),
    });

    if (verifyResult.error) {
      // Clear input first, then shake and refocus
      setOtp("");
      isVerifyingRef.current = false;
      setTimeout(() => {
        triggerShakeOnly();
        // Re-focus first input after clearing
        inputRefs.current[0]?.focus();
      }, 50);
      return;
    }

    const otp_id = verifyResult.data?.otp_id;
    if (!otp_id) {
      // Clear input first, then shake and refocus
      setOtp("");
      isVerifyingRef.current = false;
      setTimeout(() => {
        triggerShakeOnly();
        // Re-focus first input after clearing
        inputRefs.current[0]?.focus();
      }, 50);
      return;
    }

    // OTP verified successfully - show success animation first
    setIsSuccess(true);
    triggerSuccessHaptic();

    // Wait for success animation to complete, then show loading and try to login
    setTimeout(async () => {
      // Hide success, show loading
      setIsSuccess(false);
      setIsLoggingIn(true);

      // Step 2: Try to login with the otp_id
      const loginResult = await login({
        otp_id,
        phone_number: phoneNumber,
        user_type: "user",
      });

      if (loginResult.error) {
        setIsLoggingIn(false);
        // If user not found, show register form inline
        if (loginResult.error.error_code === "USER_NOT_FOUND") {
          savedOtpIdRef.current = otp_id;
          setShowRegister(true);
          isVerifyingRef.current = false;
          return;
        }

        const errorMessage = loginResult.error.error || "Loginda xatolik";
        showErrorPopup(errorMessage);
        // Clear input first, then shake and refocus
        setOtp("");
        isVerifyingRef.current = false;
        setTimeout(() => {
          triggerShakeOnly();
          // Re-focus first input after clearing
          inputRefs.current[0]?.focus();
        }, 50);
        return;
      }

      // Step 3: Login successful - save user and tokens
      if (loginResult.data) {
        const { user, access_token, refresh_token, expires_at } = loginResult.data;

        setUser(user);
        setTokens(access_token, refresh_token, expires_at);

        // Navigate to home
        navigate("/", { replace: true });
      }
    }, 800); // Wait 800ms to show the success animation before trying to login
  };

  const handleRegister = useCallback(async () => {
    if (isRegistering) return;

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !savedOtpIdRef.current || !phoneNumberRef.current) {
      triggerRegisterShakeOnly();
      return;
    }

    setIsRegistering(true);

    try {
      // Step 1: Register user with otp_id
      const registerResult = await registerUser({
        otp_id: savedOtpIdRef.current,
        user_type: "user",
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        telegram_id: telegramId ?? null,
      });

      if (registerResult.error) {
        showErrorPopup(registerResult.error.error || "Ro'yxatdan o'tishda xatolik");
        setIsRegistering(false);
        return;
      }

      // Step 2: Login to get tokens
      const loginResult = await login({
        otp_id: savedOtpIdRef.current,
        phone_number: phoneNumberRef.current!,
        user_type: "user",
      });

      if (loginResult.error) {
        showErrorPopup(loginResult.error.error || "Login qilishda xatolik");
        setIsRegistering(false);
        return;
      }

      // Step 3: Save user and tokens, navigate to home
      if (loginResult.data) {
        const { user, access_token, refresh_token, expires_at } = loginResult.data;

        setUser(user);
        setTokens(access_token, refresh_token, expires_at);
        triggerSuccessHaptic();

        setData({
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          phone_number: phoneNumberRef.current!,
        });

        navigate("/", { replace: true });
      }
    } catch (err) {
      showErrorPopup(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setIsRegistering(false);
    }
  }, [firstName, lastName, isRegistering, setData, navigate, setUser, setTokens, telegramId, triggerRegisterShakeOnly]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Auto-submit when 5 characters are entered (only when not showing register)
  useEffect(() => {
    if (otp.length === 5 && !isVerifyingRef.current && !isLoggingIn && !showRegister) {
      handleVerifyOtp(otp);
    }
  }, [otp, isLoggingIn, showRegister]);

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isResending || !phoneNumberRef.current) return;

    setIsResending(true);

    try {
      const result = await sendOtp({
        phone_number: phoneNumberRef.current,
        user_type: "user",
      });

      if (result.error) {
        showErrorPopup(result.error.error || "Kod yuborishda xatolik");
      } else {
        setResendCountdown(60);
        triggerSuccessHaptic();
        // Refocus first input
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }
    } catch (err) {
      showErrorPopup("Kod yuborishda xatolik");
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToOtp = useCallback(() => {
    navigate("/login", { replace: true });
  }, [navigate]);

  // Format phone number for display
  const formatPhone = (phone: string) => {
    if (!phone) return "";
    // Format: +998 90 123 45 67
    const p = phone.replace(/\D/g, "");
    if (p.length === 12) {
      return `+${p.slice(0, 3)} ${p.slice(3, 5)} ${p.slice(5, 8)} ${p.slice(8, 10)} ${p.slice(10)}`;
    }
    return `+${p}`;
  };

  // Don't render if no data and no phone number (unless showing success animation)
  if (!data && !phoneNumberRef.current && !isSuccess) {
    return null;
  }

  return (
    <SafeAreaLayout
      back
      onBack={showRegister ? handleBackToOtp : undefined}
      className="h-screen overflow-hidden"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Title and subtitle */}
        <div className="px-4 mb-6 pt-4">
          {showRegister ? (
            <>
              <h1 className="text-2xl font-semibold text-stone-900">
                Ro'yxatdan o'tish
              </h1>
              <p className="text-stone-500 mt-2 text-base">
                Ismingiz va familiyangizni kiriting
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-stone-900">
                {formatPhone(phoneNumberRef.current || "")}
              </h1>
              <p className="text-stone-500 mt-2 text-base">
                Shu raqamga tasdiqlash kodi yuborildi
              </p>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="px-4 flex-1">
          {showRegister ? (
            // Register Form
            <div className="space-y-4">
              <div className={`space-y-4 ${registerShake ? "animate-shake" : ""}`}>
                {/* First name input */}
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ismingiz"
                  className="w-full px-5 py-3.5 bg-stone-100 rounded-xl outline-none placeholder:text-stone-400 text-lg"
                />

                {/* Last name input */}
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Familiyangiz (ixtiyoriy)"
                  className="w-full px-5 py-3.5 bg-stone-100 rounded-xl outline-none placeholder:text-stone-400 text-lg"
                />
              </div>
            </div>
          ) : isLoggingIn ? (
            // Show loading state with "please wait" text
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="size-8 border-3 border-stone-200 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-stone-500 text-sm">Iltimos, kuting...</p>
            </div>
          ) : (
            // Custom OTP inputs
            <div className="space-y-4">
              <div className={`flex gap-2 justify-between ${shake ? "animate-shake" : ""}`}>
                {Array.from({ length: 5 }).map((_, index) => {
                  const isFocused = focusedIndex === index;

                  return (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index] || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value) {
                          // Add new digit
                          const newOtp = otp.slice(0, index) + value + otp.slice(index + 1);
                          setOtp(newOtp);
                          // Focus next input
                          if (index < 4) {
                            requestAnimationFrame(() => {
                              inputRefs.current[index + 1]?.focus();
                            });
                          }
                        } else {
                          // Handle deletion (empty value)
                          if (otp[index]) {
                            const newOtp = otp.slice(0, index) + otp.slice(index + 1);
                            setOtp(newOtp);
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace') {
                          // Move to previous input if current is empty
                          if (!otp[index] && index > 0) {
                            inputRefs.current[index - 1]?.focus();
                          }
                        } else if (e.key === 'ArrowLeft' && index > 0) {
                          inputRefs.current[index - 1]?.focus();
                        } else if (e.key === 'ArrowRight' && index < 4) {
                          inputRefs.current[index + 1]?.focus();
                        }
                      }}
                      onMouseDown={(e) => {
                        // Only allow clicking on the next empty input
                        if (index !== otp.length) {
                          e.preventDefault();
                          // Focus the next empty input instead
                          inputRefs.current[otp.length]?.focus();
                        }
                      }}
                      onFocus={() => {
                        setFocusedIndex(index);
                        // If focusing on wrong input, redirect to next empty
                        if (index !== otp.length) {
                          setTimeout(() => {
                            inputRefs.current[otp.length]?.focus();
                          }, 0);
                        }
                      }}
                      onBlur={() => {
                        setFocusedIndex(null);
                      }}
                      disabled={isSuccess}
                      className={`w-full h-14 text-center text-2xl font-bold outline-none transition-all duration-200 rounded-xl
                        ${isSuccess
                          ? 'bg-green-100 ring-2 ring-green-500 text-green-700'
                          : isFocused
                            ? 'bg-white ring-2 ring-primary shadow-sm scale-105'
                            : 'bg-stone-100'
                        } text-stone-900 placeholder:text-stone-300 disabled:cursor-default`}
                    />
                  );
                })}
              </div>

              {/* Resend hint */}
              {!isLoggingIn && !isSuccess && (
                <p className="text-stone-400 text-base mt-2">
                  {resendCountdown > 0 ? (
                    <span key="countdown" className="text-stone-500 font-normal">Kodni qayta yuborish: {resendCountdown}s</span>
                  ) : (
                    <button
                      key="resend-btn"
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isResending}
                      className="text-primary text-sm font-medium disabled:opacity-50"
                    >
                      {isResending ? "Yuborilmoqda..." : "Qayta yuborish uchun bosing"}
                    </button>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions - only show when register form is visible */}
        {showRegister && (
          <div className="px-4 pb-1 pt-2 space-y-2">
            <Button onClick={handleBackToOtp} border="full"
              disabled={isRegistering} color="secondary" size="lg">
              <ArrowLeft size={22} />
              Orqaga
            </Button>
            <Button
              onClick={handleRegister} disabled={isRegistering}
              fullWidth border="full" size="lg">
              {isRegistering ? (
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Davom etish
                  <ArrowRight size={22} />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </SafeAreaLayout>
  );
}
