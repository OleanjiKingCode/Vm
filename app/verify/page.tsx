"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MdEmail } from "react-icons/md";
import Image from "next/image";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", ""]);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [signupData, setSignupData] = useState<any>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Get signup data from session storage
    const storedData = sessionStorage.getItem("signupData");
    if (storedData) {
      const data = JSON.parse(storedData);
      setSignupData(data);
      setEmail(data.officialMail);
    } else {
      // If no signup data, redirect to signup
      router.push("/signup");
    }
    // Focus first input
    inputRefs.current[0]?.focus();
  }, [router]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split("").concat(["", "", "", ""]).slice(0, 4);
    setCode(newCode);

    // Focus the next empty input or last input
    const nextIndex = Math.min(pastedData.length, 3);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const otp = code.join("");
    if (otp.length !== 4 || !signupData) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await authApi.confirmOTP({
        officialMail: signupData.officialMail,
        otp,
        fullName: signupData.fullName,
        phoneNumber: signupData.phoneNumber,
        password: signupData.password,
      });

      if (response.responseCode === "00") {
        // Clear signup data
        sessionStorage.removeItem("signupData");
        toast.success("Account created successfully! Please login.");
        // Redirect to login
        router.push("/login");
      } else {
        const errorMsg = response.responseMessage || "Verification failed";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = "An error occurred. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem("signupData");
    router.push("/signup");
  };

  const handleResend = async () => {
    if (!signupData) return;

    setError("");
    try {
      await authApi.signUp({
        fullName: signupData.fullName,
        officialMail: signupData.officialMail,
        phoneNumber: signupData.phoneNumber,
        password: signupData.password,
      });
      setCode(["", "", "", ""]);
      inputRefs.current[0]?.focus();
      toast.success("OTP resent successfully!");
    } catch (err) {
      setError("Failed to resend code. Please try again.");
      toast.error("Failed to resend code. Please try again.");
      console.error("Resend error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/images/logo.png"
              alt="XPRESS Payment Solutions"
              width={200}
              height={80}
              priority
            />
          </div>

          {/* 2FA Form */}
          <div className="text-center space-y-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <MdEmail className="w-8 h-8 text-green-700" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Please check your email.
              </h2>
              <p className="text-gray-600">
                We&apos;ve sent a code to{" "}
                <span className="font-semibold">{email}</span>
              </p>
            </div>

            <div className="flex justify-center gap-4" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-16 h-16 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                  style={{
                    backgroundColor: digit ? "#f0fdf4" : "white",
                  }}
                />
              ))}
            </div>

            <div className="text-sm text-gray-600">
              Didn&apos;t get a code?{" "}
              <button
                onClick={handleResend}
                className="font-semibold text-green-700 hover:text-green-800 underline"
                disabled={isLoading}
              >
                Click to resend.
              </button>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 h-12 border-gray-300 rounded-lg font-medium"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleVerify}
                disabled={!code.every((digit) => digit !== "") || isLoading}
                className="flex-1 h-12 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gray-900">
        <Image
          src="/images/section.png"
          alt="XPRESS Payment Solutions"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
