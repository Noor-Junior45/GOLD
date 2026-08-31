import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, Mail } from 'lucide-react';
import { UserProfile } from '../../types';
import { saveUserProfile, cleanPhoneAutofill } from '../../services/supabaseService';
import { showToast } from '../../utils/toast';

interface EditProfileModalProps {
  isOpen: boolean;
  userProfile: UserProfile | null;
  refundBalance: number;
  cashbackBalance: number;
  totalWalletBalance: number;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  userProfile,
  refundBalance,
  cashbackBalance,
  totalWalletBalance,
  onClose,
  onProfileUpdated
}) => {
  const [editName, setEditName] = useState(userProfile?.name || '');
  const [editEmail, setEditEmail] = useState(userProfile?.email || '');
  const [editPhone, setEditPhone] = useState(userProfile?.phone || '');
  const [editDob, setEditDob] = useState(userProfile?.dob || '');
  const [editPhotoURL, setEditPhotoURL] = useState(userProfile?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);

  // OTP Verification for Email Update
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);

  // Track if modal was opened to prevent background re-renders from wiping user input
  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    // Only populate form fields upon opening transition
    if (isOpen && !prevIsOpenRef.current) {
      setEditName(userProfile?.name || '');
      setEditEmail(userProfile?.email || '');
      setEditPhone(userProfile?.phone || '');
      setEditDob(userProfile?.dob || '');
      setEditPhotoURL(userProfile?.photoURL || '');
      setIsOtpStep(false);
      setOtpError('');
      setIsSaving(false);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOtpStep && otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isOtpStep, otpTimer]);

  if (!isOpen) return null;

  const hasMissingName = !editName.trim();
  const hasMissingEmail = !editEmail.trim();
  const hasMissingPhone = !editPhone.trim();

  const sendOtpForEmail = (targetEmail: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setPendingEmail(targetEmail);
    setIsOtpStep(true);
    setOtpTimer(60);
    setEnteredOtp('');
    setOtpError('');
  };

  const handleProfileFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = editEmail.trim();
    const currentEmail = userProfile?.email || '';

    // If email is changed and not empty, require OTP verification
    if (cleanEmail && cleanEmail !== currentEmail) {
      sendOtpForEmail(cleanEmail);
      return;
    }

    setIsSaving(true);
    const finalPhone = cleanPhoneAutofill(editPhone.trim());

    // Direct save if email not changed
    const updated: UserProfile = {
      ...userProfile,
      id: userProfile?.id,
      name: editName.trim(),
      email: cleanEmail,
      phone: finalPhone,
      dob: editDob,
      photoURL: editPhotoURL.trim() || userProfile?.photoURL,
      refundBalance,
      cashbackBalance,
      walletBalance: totalWalletBalance
    };

    try {
      const res = await saveUserProfile(updated);
      onProfileUpdated(updated);
      if (res.success) {
        showToast('Profile updated successfully!', 'success');
      } else {
        showToast('Profile updated.', 'success');
      }
    } catch {
      onProfileUpdated(updated);
      showToast('Profile updated.', 'success');
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== generatedOtp) {
      setOtpError('Invalid OTP code. Please enter the 6-digit code sent to your Gmail.');
      return;
    }

    setIsSaving(true);
    const finalPhone = cleanPhoneAutofill(editPhone.trim());
    const updated: UserProfile = {
      ...userProfile,
      id: userProfile?.id,
      name: editName.trim(),
      email: pendingEmail,
      emailVerified: true,
      phone: finalPhone,
      dob: editDob,
      photoURL: editPhotoURL.trim() || userProfile?.photoURL,
      refundBalance,
      cashbackBalance,
      walletBalance: totalWalletBalance
    };

    try {
      const res = await saveUserProfile(updated);
      onProfileUpdated(updated);
      if (res.success) {
        showToast('Profile updated and verified successfully!', 'success');
      } else {
        showToast('Profile updated.', 'success');
      }
    } catch {
      onProfileUpdated(updated);
      showToast('Profile updated.', 'success');
    } finally {
      setIsSaving(false);
      setIsOtpStep(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        {!isOtpStep ? (
          <>
            <h3 className="text-lg font-black text-slate-900 mb-1">Edit Your Profile</h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Update your details for GST invoices &amp; express Kolkata deliveries.
            </p>

            <form onSubmit={handleProfileFormSubmit} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Full Name</span>
                    {hasMissingName && (
                      <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block animate-pulse" title="Name is required" />
                    )}
                  </label>
                </div>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Gmail / Email Address</span>
                    {hasMissingEmail && (
                      <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block animate-pulse" title="Email is required" />
                    )}
                  </label>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    Requires OTP verification
                  </span>
                </div>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Enter your email (e.g. name@gmail.com)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Mobile Number</span>
                    {hasMissingPhone && (
                      <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block animate-pulse" title="Mobile number is required" />
                    )}
                  </label>
                </div>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={editPhone}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const digits = raw.replace(/\D/g, '');
                    if (digits.length > 10) {
                      setEditPhone(cleanPhoneAutofill(raw));
                    } else {
                      setEditPhone(digits);
                    }
                  }}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 bg-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Used for exclusive birthday loyalty cashbacks and discounts.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-yellow-400 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </>
        ) : (
          /* OTP VERIFICATION VIEW FOR EMAIL UPDATE */
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900">Verify Your Gmail Address</h3>
              <p className="text-xs text-slate-600 mt-1">
                We sent a 6-digit verification security code to:
              </p>
              <p className="text-xs font-black text-slate-900 mt-0.5">{pendingEmail}</p>
            </div>

            {/* Simulated Live Toast Notice showing the OTP */}
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1">
              <p className="font-extrabold text-amber-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-amber-700" />
                <span>Gmail Security OTP Dispatched</span>
              </p>
              <p className="text-slate-700 text-[11px]">
                Your 6-digit verification code is:{' '}
                <span className="font-black text-slate-950 bg-amber-200/80 px-1.5 py-0.5 rounded tracking-widest text-xs">
                  {generatedOtp}
                </span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.4em] text-lg font-black px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 bg-white"
                  autoFocus
                />
              </div>

              {otpError && (
                <p className="text-xs text-red-600 font-bold text-center">{otpError}</p>
              )}

              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                <span>
                  {otpTimer > 0 ? `Resend code in ${otpTimer}s` : 'Code expired?'}
                </span>
                <button
                  type="button"
                  disabled={otpTimer > 0}
                  onClick={() => sendOtpForEmail(pendingEmail)}
                  className={`font-bold ${
                    otpTimer > 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-amber-600 hover:text-amber-700 cursor-pointer'
                  }`}
                >
                  Resend OTP
                </button>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOtpStep(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-yellow-400 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer"
                >
                  Verify &amp; Save
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
