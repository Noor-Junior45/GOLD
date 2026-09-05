import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  LogIn,
  UserPlus
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabaseClient';
import {
  saveUserProfile,
  signInWithGoogle,
  fetchUserProfileFromSupabase
} from '../services/supabaseService';
import { sendLoginNotificationEmail } from '../services/securityNotificationService';

interface LoginPageProps {
  onAuthSuccess: (phone: string, name: string, email?: string) => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();

  // Mode: 'signin' | 'signup' | 'forgot'
  const [mode, setMode] = useState<AuthMode>('signin');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [magicLinkCooldown, setMagicLinkCooldown] = useState(0);

  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Magic Link cooldown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (magicLinkCooldown > 0) {
      interval = setInterval(() => {
        setMagicLinkCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [magicLinkCooldown]);

  const resetMessages = () => {
    setError(null);
    setInfoMessage(null);
  };

  // --- 1. GOOGLE SIGN IN ---
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    resetMessages();
    try {
      const res = await signInWithGoogle();
      if (res.error) {
        setError(res.error.message || 'Google Sign-In failed. Please try again.');
      }
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || 'Google Sign-In encountered an issue.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // --- 2. PASSWORD SIGN IN ---
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (loginError) {
        setError(loginError.message || 'Invalid email or password.');
      } else if (data.user) {
        const cloudProf = await fetchUserProfileFromSupabase(data.user.id);
        const userFullName =
          cloudProf?.name ||
          data.user.user_metadata?.full_name ||
          cleanEmail.split('@')[0] ||
          'Giriraj Customer';
        const finalPhone = cloudProf?.phone || data.user.phone || data.user.user_metadata?.phone || '';

        onAuthSuccess(finalPhone, userFullName, cleanEmail);
        sendLoginNotificationEmail({
          email: cleanEmail,
          name: userFullName,
          userId: data.user.id,
          loginMethod: 'Email & Password',
          force: true
        }).catch((e) => console.debug('[Security Alert Trigger Note]:', e));
        navigate('/');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. PASSWORD SIGN UP ---
  const handlePasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account.');
      } else if (data.session && data.user) {
        const cloudProf = await fetchUserProfileFromSupabase(data.user.id);
        const userFullName =
          cloudProf?.name ||
          cleanEmail.split('@')[0] ||
          'Giriraj Customer';
        const finalPhone = cloudProf?.phone || data.user.phone || data.user.user_metadata?.phone || '';

        onAuthSuccess(finalPhone, userFullName, cleanEmail);
        sendLoginNotificationEmail({
          email: cleanEmail,
          name: userFullName,
          userId: data.user.id,
          loginMethod: 'New Account Creation & Password Sign-in',
          force: true
        }).catch((e) => console.debug('[Security Alert Trigger Note]:', e));
        navigate('/');
      } else {
        setInfoMessage(`Account created! We have sent a confirmation link to ${cleanEmail}.`);
        setMode('signin');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. FORGOT PASSWORD ---
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter your account email.');
      return;
    }

    setIsLoading(true);
    try {
      const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();
      const redirectTo = isNative
        ? 'buildnow://reset-password'
        : `${window.location.origin}/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });

      if (resetError) {
        setError(resetError.message || 'Failed to send reset link.');
      } else {
        setInfoMessage(`Password reset link sent to ${cleanEmail}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset link.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 5. MAGIC LINK (1-CLICK PASSWORDLESS) ---
  const handleSendMagicLink = async () => {
    resetMessages();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter your email above to receive a magic link.');
      return;
    }

    if (magicLinkCooldown > 0) return;

    setIsMagicLoading(true);
    try {
      const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();
      const redirectTo = isNative ? 'buildnow://login' : window.location.origin;

      const { error: magicError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (magicError) {
        setError(magicError.message || 'Failed to send magic link.');
      } else {
        setMagicLinkCooldown(60);
        setInfoMessage(`Magic link sent to ${cleanEmail}! Check your inbox.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send magic link.';
      setError(msg);
    } finally {
      setIsMagicLoading(false);
    }
  };

  const isAnyLoading = isLoading || isMagicLoading || isGoogleLoading;

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      {/* Main Centered Login Container (Borderless Full-Page Look) */}
      <div className="w-full max-w-md bg-white border-0 shadow-none p-4 sm:p-6 space-y-5">
        
        {/* Brand Logo & Name Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="relative">
            <img
              src="/buildnow.png"
              alt="BuildNow Logo"
              className="w-16 h-16 object-contain rounded-2xl shadow-sm border border-slate-100 p-1 bg-white"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center" />
          </div>

          <div>
            <div className="text-3xl font-bold font-bodoni flex items-center justify-center leading-none tracking-tight">
              <span className="text-slate-950">Build</span>
              <span className="text-[#00875a]">Now</span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Electrical &amp; Construction Materials Hub
            </p>
          </div>
        </div>

        {/* Clean Login Heading */}
        <div className="text-center pt-1 pb-1">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h1>
        </div>

        {/* Feedback Messages */}
        {infoMessage && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{infoMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold animate-in fade-in leading-relaxed">
            {error}
          </div>
        )}

        {/* Authentication Forms */}
        <div className="space-y-4">
          
          {/* 1. SIGN IN MODE */}
          {mode === 'signin' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 tracking-wider uppercase mb-1">
                  EMAIL ADDRESS
                </label>
                <div className="flex items-center border-b border-slate-300 focus-within:border-slate-800 transition-colors pb-1">
                  <Mail className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 tracking-wider uppercase mb-1">
                  PASSWORD
                </label>
                <div className="flex items-center border-b border-slate-300 focus-within:border-slate-800 transition-colors pb-1">
                  <Lock className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Forgot password moved below the password horizontal line */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      resetMessages();
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* Primary Login Button (kept yellow) */}
              <button
                type="submit"
                disabled={isAnyLoading}
                className="w-full py-3 px-4 rounded-2xl bg-amber-400 hover:bg-yellow-400 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">Signing In...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </>
                )}
              </button>

              {/* Create Account Helper Toggle */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    resetMessages();
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Don't have an account? <span className="font-bold text-amber-700 hover:text-amber-800">Create one</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. SIGN UP MODE */}
          {mode === 'signup' && (
            <form onSubmit={handlePasswordSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 tracking-wider uppercase mb-1">
                  EMAIL ADDRESS
                </label>
                <div className="flex items-center border-b border-slate-300 focus-within:border-slate-800 transition-colors pb-1">
                  <Mail className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 tracking-wider uppercase mb-1">
                  CREATE PASSWORD
                </label>
                <div className="flex items-center border-b border-slate-300 focus-within:border-slate-800 transition-colors pb-1">
                  <Lock className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 tracking-wider uppercase mb-1">
                  CONFIRM PASSWORD
                </label>
                <div className="flex items-center border-b border-slate-300 focus-within:border-slate-800 transition-colors pb-1">
                  <Lock className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAnyLoading}
                className="w-full py-3 px-4 rounded-2xl bg-amber-400 hover:bg-yellow-400 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  'Creating Account...'
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    resetMessages();
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Already have an account? <span className="font-bold text-amber-700 hover:text-amber-800">Login</span>
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center pb-1">
                <p className="text-xs text-slate-500">Enter your email and we will send a password reset link.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 tracking-wider uppercase mb-1">
                  ACCOUNT EMAIL
                </label>
                <div className="flex items-center border-b border-slate-300 focus-within:border-slate-800 transition-colors pb-1">
                  <Mail className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAnyLoading}
                className="w-full py-3 px-4 rounded-2xl bg-amber-400 hover:bg-yellow-400 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  'Sending Reset Link...'
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Send Password Reset Link</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    resetMessages();
                  }}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                >
                  Remember password? Back to Login
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
              or continue with
            </span>
          </div>

          {/* OR CONTINUE WITH SECTION: Magic Link & Google */}
          <div className="space-y-2.5">
            {/* Magic Link with email logo */}
            <button
              type="button"
              onClick={handleSendMagicLink}
              disabled={isAnyLoading || magicLinkCooldown > 0}
              className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 bg-white cursor-pointer active:scale-[0.99] disabled:opacity-50 shadow-2xs"
            >
              <Mail className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {isMagicLoading
                  ? 'Sending Magic link...'
                  : magicLinkCooldown > 0
                  ? `Resend Magic link (${magicLinkCooldown}s)`
                  : 'Magic link'}
              </span>
            </button>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAnyLoading}
              className="w-full py-2.5 px-4 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 bg-white cursor-pointer active:scale-[0.99] disabled:opacity-50 shadow-2xs"
            >
              {isGoogleLoading ? (
                <span className="flex items-center gap-2 text-xs text-slate-600">Connecting Google...</span>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Simple Hyperlink Legal Text */}
        <div className="pt-3 text-center border-t border-slate-100">
          <p className="text-xs text-slate-500">
            You agree to our{' '}
            <Link
              to="/terms"
              className="text-slate-700 hover:text-slate-900 underline underline-offset-2 decoration-slate-300 hover:decoration-slate-600 transition-colors font-medium"
            >
              Terms of service
            </Link>
            {' '}and{' '}
            <Link
              to="/privacy"
              className="text-slate-700 hover:text-slate-900 underline underline-offset-2 decoration-slate-300 hover:decoration-slate-600 transition-colors font-medium"
            >
              Privacy policy
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
