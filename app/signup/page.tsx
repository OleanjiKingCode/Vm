"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MdVisibility,
  MdVisibilityOff,
  MdCheck,
  MdClose,
} from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [officialMail, setOfficialMail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordValidation = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const isFormValid =
    fullName.trim() !== "" &&
    officialMail.trim() !== "" &&
    phoneNumber.trim() !== "" &&
    isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await authApi.signUp({
        fullName,
        officialMail,
        phoneNumber,
        password,
      });

      if (response.responseCode === "00") {
        // Store signup data for OTP verification
        sessionStorage.setItem(
          "signupData",
          JSON.stringify({
            fullName,
            officialMail,
            phoneNumber,
            password,
          })
        );

        toast.success("OTP sent to your email!");
        // Redirect to verification page
        router.push("/verify");
      } else {
        const errorMsg = response.responseMessage || "Sign up failed";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = "An error occurred. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
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

          {/* Form */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Sign up</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 px-4 rounded-lg border-gray-300"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={officialMail}
                  onChange={(e) => setOfficialMail(e.target.value)}
                  className="h-12 px-4 rounded-lg border-gray-300"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-12 px-4 rounded-lg border-gray-300"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 px-4 pr-12 rounded-lg border-gray-300"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <MdVisibilityOff className="w-5 h-5" />
                    ) : (
                      <MdVisibility className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    password ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Password must contain:
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        {passwordValidation.length ? (
                          <MdCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <MdClose className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={
                            passwordValidation.length
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordValidation.uppercase ? (
                          <MdCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <MdClose className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={
                            passwordValidation.uppercase
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          One uppercase letter (A-Z)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordValidation.lowercase ? (
                          <MdCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <MdClose className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={
                            passwordValidation.lowercase
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          One lowercase letter (a-z)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordValidation.number ? (
                          <MdCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <MdClose className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={
                            passwordValidation.number
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          One number (0-9)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordValidation.special ? (
                          <MdCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <MdClose className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={
                            passwordValidation.special
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          One special character (!@#$%^&*)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full h-12 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-green-700 hover:text-green-800"
              >
                Log in
              </Link>
            </p>
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
