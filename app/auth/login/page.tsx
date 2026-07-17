"use client";

import { useState } from "react";
import { AuthLayout } from "../../components/AuthLayout";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AuthPage() {
  const [isFlipped, setIsFlipped] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Register State
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setLoginError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginError(error.message);
      setIsLoginLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegisterLoading(true);
    setRegisterError(null);

    const { error } = await supabase.auth.signUp({
      email: registerEmail,
      password: registerPassword,
      options: {
        data: {
          full_name: registerName,
        },
      },
    });

    if (error) {
      setRegisterError(error.message);
      setIsRegisterLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-stone-200/50 p-2 sm:p-3 flex flex-col md:flex-row min-h-[600px]">

        {/* Left Side: Form Area (with 3D Flip) */}
        <div
          className="flex-1 flex flex-col justify-center relative perspective-1000 p-8 sm:p-12"
          style={{ perspective: "1500px" }}
        >
          <motion.div
            className="relative w-full h-full flex flex-col justify-center"
            style={{
              transformStyle: "preserve-3d",
            }}
            animate={{ rotateY: isFlipped ? -180 : 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 60, damping: 15 }}
          >

            {/* Front: Login Page */}
            <div
              className="absolute inset-0 w-full flex flex-col justify-center bg-transparent"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 tracking-tight">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm text-stone-500">
                  Enter your details to access your account.
                </p>
              </div>

              <form className="space-y-6 max-w-sm mx-auto w-full" onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-300 placeholder-stone-400 text-stone-900 rounded-xl focus:outline-none focus:ring-[#8b5a45] focus:border-[#8b5a45] sm:text-sm bg-white/50 backdrop-blur-sm transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-stone-700">
                        Password
                      </label>
                      <button type="button" className="text-xs font-medium text-[#8b5a45] hover:text-[#724a38] transition-colors">
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-300 placeholder-stone-400 text-stone-900 rounded-xl focus:outline-none focus:ring-[#8b5a45] focus:border-[#8b5a45] sm:text-sm bg-white/50 backdrop-blur-sm transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-3 rounded-xl border border-red-100">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#8b5a45] hover:bg-[#724a38] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5a45] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                >
                  {isLoginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
                </button>

                <div className="mt-8 text-center border-t border-stone-200/60 pt-6">
                  <span className="text-sm text-stone-500 mr-2">Don&apos;t have an account?</span>
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="text-sm font-bold text-[#8b5a45] hover:text-[#724a38] transition-colors cursor-pointer"
                  >
                    Create an account
                  </button>
                </div>
              </form>
            </div>

            {/* Back: Register Page */}
            <div
              className="w-full flex flex-col justify-center bg-transparent"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 tracking-tight">
                  Create an account
                </h2>
                <p className="mt-2 text-sm text-stone-500">
                  Join us to discover and curate your next favorite read.
                </p>
              </div>

              <form className="space-y-6 max-w-sm mx-auto w-full" onSubmit={handleRegister}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-300 placeholder-stone-400 text-stone-900 rounded-xl focus:outline-none focus:ring-[#8b5a45] focus:border-[#8b5a45] sm:text-sm bg-white/50 backdrop-blur-sm transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-300 placeholder-stone-400 text-stone-900 rounded-xl focus:outline-none focus:ring-[#8b5a45] focus:border-[#8b5a45] sm:text-sm bg-white/50 backdrop-blur-sm transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-300 placeholder-stone-400 text-stone-900 rounded-xl focus:outline-none focus:ring-[#8b5a45] focus:border-[#8b5a45] sm:text-sm bg-white/50 backdrop-blur-sm transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {registerError && (
                  <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-3 rounded-xl border border-red-100">
                    {registerError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isRegisterLoading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#8b5a45] hover:bg-[#724a38] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5a45] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                >
                  {isRegisterLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign up"}
                </button>

                <div className="mt-8 text-center border-t border-stone-200/60 pt-6">
                  <span className="text-sm text-stone-500 mr-2">Already have an account?</span>
                  <button
                    type="button"
                    onClick={() => setIsFlipped(false)}
                    className="text-sm font-bold text-[#8b5a45] hover:text-[#724a38] transition-colors cursor-pointer"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </div>

          </motion.div>
        </div>

        {/* Right Side: Image */}
        <div className="hidden md:block flex-1 relative rounded-2xl overflow-hidden shadow-inner">
          <Image
            src="/auth-book.png"
            alt="An open book in warm lighting"
            fill
            className="object-cover"
            priority
          />
        </div>

      </div>
    </AuthLayout>
  );
}
