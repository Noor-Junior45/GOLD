import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Send,
  UserPlus,
  KeyRound
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import {
  saveUserProfile,
  signInWithGoogle
} from '../services/supabaseService';
import { isWebViewEnvironment } from '../utils/webViewDetection';

interface LoginPageProps {
  onAuthSuccess: (phone: string, name: string, email?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const isWebView = isWebViewEnvironment();

  // Mode: 'password' | 'magic'
  const [authMode, setAuthMode] = useState<'password' | 'magic'>('password');

  // Password sub-view: 'login' | 'signup' | 'forgot'
  const [passwordView, setPasswordView] = useState<'login' | 'signup' | 'forgot'>('login');

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [magicLinkCooldown, setMagicLinkCooldown] = useState(0);

  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Magic Link cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
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
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  // --- 2. PASSWORD LOGIN ---
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
        const userFullName =
          data.user.user_metadata?.full_name ||
          cleanEmail.split('@')[0] ||
          'Giriraj Customer';
        saveUserProfile({
          email: cleanEmail,
          name: userFullName,
        });
        onAuthSuccess(data.user.phone || '', userFullName, cleanEmail);
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
      const { error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account.');
      } else {
        setInfoMessage(`Account created! Check ${cleanEmail} to verify.`);
        setPasswordView('login');
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
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
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

  // --- 5. MAGIC LINK ---
  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (magicLinkCooldown > 0) return;

    setIsLoading(true);
    try {
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (magicError) {
        setError(magicError.message || 'Failed to send login link.');
      } else {
        setMagicLinkCooldown(60);
        setInfoMessage(`Login link sent to ${cleanEmail}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send login link.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 relative">
      {/* Minimal Top Navigation */}
      <div className="w-full max-w-sm mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-black transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>
      </div>

      {/* Main Minimalist Login Card */}
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <Link to="/" className="cursor-pointer focus:outline-none">
            <img
              src="https://i.imgur.com/tGG9UN0.png"
              alt="BuildNow Logo"
              className="w-14 h-14 object-contain"
            />
          </Link>
          <div className="text-2xl font-bold font-bodoni flex items-center justify-center leading-none">
            <span className="text-black">Build</span>
            <span className="text-[#00875a]">Now</span>
          </div>
        </div>

        {/* Feedback Messages */}
        {infoMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold animate-in fade-in">
            {error}
          </div>
        )}

        {/* Stack-Wise Authentication Options */}
        <div className="space-y-3">
          
          {/* 1. Google Sign-In Button (hidden in restricted plain WebViews) */}
          {!isWebView ? (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 bg-white cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          ) : (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <p className="text-[11px] text-slate-600 font-medium">
                Sign in with your email &amp; password below for quick access.
              </p>
            </div>
          )}

          {/* Mode Selector Tabs (Password vs Magic Link) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setPasswordView('login');
                resetMessages();
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'password'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('magic');
                resetMessages();
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'magic'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Magic Link</span>
            </button>
          </div>

          {/* Password Authentication Forms */}
          {authMode === 'password' && (
            <div className="space-y-3 pt-1">
              {passwordView === 'login' && (
                <form onSubmit={handlePasswordLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email
                    </label>
                    <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 bg-white">
                      <span className="px-3 py-2.5 bg-slate-50 border-r border-slate-200 text-slate-500 flex items-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none text-slate-900 placeholder:text-slate-400"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordView('forgot');
                          resetMessages();
                        }}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 bg-white">
                      <span className="px-3 py-2.5 bg-slate-50 border-r border-slate-200 text-slate-500 flex items-center shrink-0">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none text-slate-900 placeholder:text-slate-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="px-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-yellow-400 text-slate-950 font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-50"
                  >
                    {isLoading ? 'Logging in...' : 'Log In'}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordView('signup');
                        resetMessages();
                      }}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Don't have an account? <span className="font-bold text-amber-700 underline">Sign up</span>
                    </button>
                  </div>
                </form>
              )}

              {passwordView === 'signup' && (
                <form onSubmit={handlePasswordSignUp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email
                    </label>
                    <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 bg-white">
                      <span className="px-3 py-2.5 bg-slate-50 border-r border-slate-200 text-slate-500 flex items-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none text-slate-900 placeholder:text-slate-400"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Create Password
                    </label>
                    <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 bg-white">
                      <span className="px-3 py-2.5 bg-slate-50 border-r border-slate-200 text-slate-500 flex items-center shrink-0">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none text-slate-900 placeholder:text-slate-400"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="px-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 bg-white">
                      <span className="px-3 py-2.5 bg-slate-50 border-r border-slate-200 text-slate-500 flex items-center shrink-0">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none text-slate-900 placeholder:text-slate-400"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="px-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-yellow-400 text-slate-950 font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-50"
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
                        setPasswordView('login');
                        resetMessages();
                      }}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Already have an account? <span className="font-bold text-amber-700 underline">Log in</span>
                    </button>
                  </div>
                </form>
              )}

              {passwordView === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Email
                    </label>
                    <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 bg-white">
                      <span className="px-3 py-2.5 bg-slate-50 border-r border-slate-200 text-slate-500 flex items-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none text-slate-900 placeholder:text-slate-400"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-yellow-400 text-slate-950 font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-50"
                  >
                    {isLoading ? (
                      'Sending Reset Link...'
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordView('login');
                        resetMessages();
                      }}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Remember password? <span className="font-bold text-amber-700 underline">Back to Login</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Magic Link Form */}
          {authMode === 'magic' && (
            <form onSubmit={handleSendMagicLink} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email
                </label>
                <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 bg-white">
                  <span className="px-3 py-2.5 bg-slate-50 border-r border-slate-200 text-slate-500 flex items-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none text-slate-900 placeholder:text-slate-400"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || magicLinkCooldown > 0}
                className={`w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] ${
                  magicLinkCooldown > 0
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-amber-400 hover:bg-yellow-400 text-slate-950'
                }`}
              >
                {isLoading ? (
                  'Sending Link...'
                ) : magicLinkCooldown > 0 ? (
                  `Resend in ${magicLinkCooldown}s`
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Magic Link</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
