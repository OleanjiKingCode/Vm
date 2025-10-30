"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MdArrowBack } from "react-icons/md";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending reset email
    setIsSubmitted(true);
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
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
            >
              <MdArrowBack className="w-4 h-4" />
              Back to login
            </Link>

            {!isSubmitted ? (
              <>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Forgot password?
                </h2>
                <p className="text-gray-600 mb-8">
                  No worries, we&apos;ll send you reset instructions.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 px-4 rounded-lg border-gray-300"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg"
                  >
                    Reset password
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl">📧</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Check your email
                  </h2>
                  <p className="text-gray-600">
                    We&apos;ve sent a password reset link to <br />
                    <span className="font-semibold">{email}</span>
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Didn&apos;t receive the email?{" "}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="font-semibold text-green-700 hover:text-green-800"
                  >
                    Click to resend
                  </button>
                </p>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full h-12 border-gray-300 rounded-lg font-medium"
                  >
                    <MdArrowBack className="w-4 h-4 mr-2" />
                    Back to login
                  </Button>
                </Link>
              </div>
            )}
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
