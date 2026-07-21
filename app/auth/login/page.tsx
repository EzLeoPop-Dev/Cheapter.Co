"use client";

import { useState } from "react";
import { AuthLayout } from "../../components/AuthLayout";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Mail, Lock, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

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

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setLoginError(null);

    const result = await signIn("credentials", {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        setLoginError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        setLoginError(result.error); 
      }
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

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
      }

      const result = await signIn("credentials", {
        email: registerEmail,
        password: registerPassword,
        redirect: false,
      });

      if (result?.error) {
        setRegisterError("สมัครสำเร็จ แต่เข้าสู่ระบบอัตโนมัติล้มเหลว กรุณาล็อกอินด้วยตัวเอง");
        setIsRegisterLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      setRegisterError(error.message);
      setIsRegisterLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetLoading(true);
    setResetMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "เกิดข้อผิดพลาด");

      setResetMessage({ type: 'success', text: "ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว" });
      setResetEmail("");
    } catch (error: any) {
      setResetMessage({ type: 'error', text: error.message });
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[1000px] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 p-3 sm:p-4 flex flex-col md:flex-row min-h-[650px] relative z-10 mx-4">

        {/* 🌟 Left Side: Form Area */}
        <div
          className="flex-1 flex flex-col justify-center relative perspective-1000 p-6 sm:p-10 lg:p-14"
          style={{ perspective: "1500px" }}
        >
          <motion.div
            className="relative w-full h-full flex flex-col justify-center"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: isFlipped ? -180 : 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 50, damping: 15 }}
          >

            {/* --- FRONT: Login & Forgot Password --- */}
            <div
              className="absolute inset-0 w-full flex flex-col justify-center bg-transparent"
              style={{ backfaceVisibility: "hidden" }}
            >
              <AnimatePresence mode="wait">
                {isForgotPassword ? (
                  /* Form: Forgot Password */
                  <motion.div 
                    key="forgot"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full max-w-sm mx-auto"
                  >
                    <button 
                      onClick={() => { setIsForgotPassword(false); setResetMessage(null); }}
                      className="flex items-center text-sm font-medium text-stone-400 hover:text-stone-800 transition-colors mb-8 group"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" /> 
                      Back to login
                    </button>

                    <div className="mb-8">
                      <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 tracking-tight">
                        Reset Password
                      </h2>
                      <p className="mt-3 text-sm text-stone-500 leading-relaxed">
                        Enter your email and we'll send you a link to reset your password.
                      </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleForgotPassword}>
                      <div className="relative">
                        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5a45]/20 focus:border-[#8b5a45] focus:bg-white sm:text-sm transition-all duration-200"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>

                      {resetMessage && (
                        <div className={`text-sm font-medium text-center p-3.5 rounded-xl border ${resetMessage.type === 'success' ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
                          {resetMessage.text}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isResetLoading}
                        className="w-full flex justify-center py-3.5 px-4 text-sm font-bold rounded-xl text-white bg-[#8b5a45] hover:bg-[#724a38] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(139,90,69,0.2)]"
                      >
                        {isResetLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  /* Form: Login */
                  <motion.div 
                    key="login"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full max-w-sm mx-auto"
                  >
                    <div className="mb-10">
                      <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 tracking-tight">
                        Welcome back
                      </h2>
                      <p className="mt-3 text-sm text-stone-500">
                        Please enter your details to sign in.
                      </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleLogin}>
                      <div>
                        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5a45]/20 focus:border-[#8b5a45] focus:bg-white sm:text-sm transition-all duration-200"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            Password
                          </label>
                          <button 
                            type="button" 
                            onClick={() => setIsForgotPassword(true)}
                            className="text-xs font-bold text-[#8b5a45] hover:text-[#724a38] transition-colors"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5a45]/20 focus:border-[#8b5a45] focus:bg-white sm:text-sm transition-all duration-200"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      {loginError && (
                        <div className="text-red-600 text-sm font-medium text-center bg-red-50 p-3.5 rounded-xl border border-red-100">
                          {loginError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoginLoading}
                        className="w-full flex justify-center py-3.5 px-4 mt-2 text-sm font-bold rounded-xl text-white bg-[#8b5a45] hover:bg-[#724a38] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(139,90,69,0.2)]"
                      >
                        {isLoginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
                      </button>

                      <div className="mt-8 text-center">
                        <span className="text-sm text-stone-500 mr-2">Don't have an account?</span>
                        <button
                          type="button"
                          onClick={() => setIsFlipped(true)}
                          className="text-sm font-bold text-[#8b5a45] hover:text-[#724a38] transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#8b5a45] hover:after:w-full after:transition-all after:duration-300"
                        >
                          Create account
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- BACK: Register Page --- */}
            <div
              className="w-full flex flex-col justify-center bg-transparent absolute inset-0"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="w-full max-w-sm mx-auto">
                <div className="mb-8">
                  <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 tracking-tight">
                    Create an Account
                  </h2>
                  <p className="mt-3 text-sm text-stone-500">
                    Create an account to discover and curate your next favorite read.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleRegister}>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5a45]/20 focus:border-[#8b5a45] focus:bg-white sm:text-sm transition-all duration-200"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5a45]/20 focus:border-[#8b5a45] focus:bg-white sm:text-sm transition-all duration-200"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5a45]/20 focus:border-[#8b5a45] focus:bg-white sm:text-sm transition-all duration-200"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {registerError && (
                    <div className="text-red-600 text-sm font-medium text-center bg-red-50 p-3.5 rounded-xl border border-red-100 mt-2">
                      {registerError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isRegisterLoading}
                    className="w-full flex justify-center py-3.5 px-4 mt-6 text-sm font-bold rounded-xl text-white bg-[#8b5a45] hover:bg-[#724a38] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(139,90,69,0.2)]"
                  >
                    {isRegisterLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                  </button>

                  <div className="mt-8 text-center">
                    <span className="text-sm text-stone-500 mr-2">Already have an account?</span>
                    <button
                      type="button"
                      onClick={() => setIsFlipped(false)}
                      className="text-sm font-bold text-[#8b5a45] hover:text-[#724a38] transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#8b5a45] hover:after:w-full after:transition-all after:duration-300"
                    >
                      Sign in
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </motion.div>
        </div>

        {/* 🌟 Right Side: High-Quality Image (Editorial Look) */}
        <div className="hidden md:block flex-1 relative rounded-[1.5rem] overflow-hidden group">
          {/* ดึงรูปสถานที่จริงจาก Unsplash เพื่อความพรีเมียม */}
          <img
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000&auto=format&fit=crop"
            alt="Library aesthetic"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-110"
          />
          {/* Gradient Overlay แบบนุ่มนวล */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-stone-900/10 pointer-events-none flex flex-col justify-end p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <h3 className="text-white font-serif text-3xl leading-snug font-medium mb-4">
                "A room without books is like a body without a soul."
              </h3>
              <div className="w-12 h-1 bg-[#8b5a45] mb-4 rounded-full"></div>
              <p className="text-stone-300 font-medium tracking-wide text-sm">
                — Marcus Tullius Cicero
              </p>
            </motion.div>
          </div>
        </div>

      </div>
    </AuthLayout>
  );
}