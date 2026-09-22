import React, { useState } from 'react';
import { User, AuthMode } from '../../types';
import { 
  getUsers, 
  saveUser, 
  createResetToken, 
  verifyResetCode, 
  completePasswordReset 
} from '../../utils/storage';
import { retroSound } from '../../utils/sound';
import { PixelIcon } from '../PixelIcon';
import { LogIn, UserPlus, KeyRound, Sparkles, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

const AVATAR_OPTIONS = ['🧙‍♂️', '⚔️', '🧝‍♀️', '👑', '🛡️', '🪙'];

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('nurilikhsani04@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState('🧙‍♂️');

  // Password Recovery state
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [simulatedOtpNotice, setSimulatedOtpNotice] = useState<string | null>(null);

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setSimulatedOtpNotice(null);
  };

  const switchMode = (newMode: AuthMode) => {
    retroSound.playClick();
    clearMessages();
    setMode(newMode);
    setRecoveryStep(1);
  };

  // 1. Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const users = getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    if (!found) {
      retroSound.playWarning();
      setErrorMsg('Email tidak terdaftar. Silakan registrasi terlebih dahulu!');
      return;
    }

    if (found.password && found.password !== loginPassword) {
      retroSound.playWarning();
      setErrorMsg('Kata sandi salah. Coba lagi atau gunakan menu pemulihan!');
      return;
    }

    retroSound.playSuccess();
    onLoginSuccess(found);
  };

  // 1-Click Quick Demo Login
  const handleDemoLogin = (userType: 'nuril' | 'demo') => {
    retroSound.playCoin();
    clearMessages();
    const users = getUsers();
    const targetEmail = userType === 'nuril' ? 'nurilikhsani04@gmail.com' : 'demo@pikselkas.id';
    let user = users.find((u) => u.email.toLowerCase() === targetEmail);
    if (!user) {
      user = users[0];
    }
    onLoginSuccess(user);
  };

  // 2. Handle Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      retroSound.playWarning();
      setErrorMsg('Semua kolom wajib diisi!');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      retroSound.playWarning();
      setErrorMsg('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    if (regPassword.length < 6) {
      retroSound.playWarning();
      setErrorMsg('Kata sandi minimal 6 karakter!');
      return;
    }

    const users = getUsers();
    const existing = users.find(
      (u) => u.email.toLowerCase() === regEmail.trim().toLowerCase()
    );

    if (existing) {
      retroSound.playWarning();
      setErrorMsg('Email ini sudah terdaftar! Silakan login.');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: regEmail.trim().toLowerCase(),
      name: regName.trim(),
      avatar: regAvatar,
      password: regPassword,
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);
    retroSound.playSuccess();
    setSuccessMsg('Karakter akun baru berhasil dibuat! Selamat datang di PikselKas.');
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 900);
  };

  // 3. Handle Password Recovery - Step 1: Send OTP
  const handleSendRecoveryOtp = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const users = getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === recoveryEmail.trim().toLowerCase()
    );

    if (!found) {
      retroSound.playWarning();
      setErrorMsg('Email tidak ditemukan dalam sistem.');
      return;
    }

    const code = createResetToken(recoveryEmail.trim());
    retroSound.playCoin();
    setSimulatedOtpNotice(code);
    setRecoveryStep(2);
  };

  // Handle Password Recovery - Step 2: Verify & Reset
  const handleCompleteReset = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!verifyResetCode(recoveryEmail.trim(), recoveryCode.trim())) {
      retroSound.playWarning();
      setErrorMsg('Kode token pemulihan salah atau telah kadaluarsa!');
      return;
    }

    if (newPassword.length < 6) {
      retroSound.playWarning();
      setErrorMsg('Kata sandi baru minimal 6 karakter!');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      retroSound.playWarning();
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    const success = completePasswordReset(recoveryEmail.trim(), newPassword);
    if (success) {
      retroSound.playSuccess();
      setRecoveryStep(3);
      setSuccessMsg('Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.');
      setLoginEmail(recoveryEmail.trim());
      setLoginPassword(newPassword);
    } else {
      retroSound.playWarning();
      setErrorMsg('Gagal memperbarui kata sandi. Coba lagi.');
    }
  };

  return (
    <div className="min-h-screen pixel-bg flex flex-col justify-center items-center p-4 selection:bg-[#f59e0b] selection:text-black">
      {/* Decorative Pixel Stars/Coins Top */}
      <div className="flex items-center gap-3 mb-4 animate-pixel-float">
        <PixelIcon name="coin" size={32} className="animate-coin-spin" />
        <span className="font-pixel text-xl sm:text-2xl text-[#f59e0b] tracking-wider drop-shadow-[3px_3px_0px_#000]">
          PIKSELKAS
        </span>
        <PixelIcon name="chest" size={32} />
      </div>

      <p className="font-pixel text-[10px] sm:text-xs text-slate-300 text-center mb-6 max-w-sm">
        Pencatatan Keuangan Pribadi & Outstanding Piutang Bertema Pixel Retro
      </p>

      {/* Main Authentication Box */}
      <div className="w-full max-w-md bg-[#1e293b] border-4 border-black p-5 sm:p-7 pixel-card relative">
        {/* Top Banner Mode Indicator */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {mode === 'login' ? '🗝️' : mode === 'register' ? '✨' : '🛡️'}
            </span>
            <h2 className="font-pixel text-xs sm:text-sm text-[#f59e0b] uppercase">
              {mode === 'login'
                ? 'MASUK KE AKUN'
                : mode === 'register'
                ? 'REGISTRASI AKUN BARU'
                : 'PEMULIHAN KATA SANDI'}
            </h2>
          </div>

          {mode !== 'login' && (
            <button
              onClick={() => switchMode('login')}
              className="text-[10px] font-pixel text-slate-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft size={12} />
              <span>LOGIN</span>
            </button>
          )}
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/80 border-2 border-rose-800 text-rose-300 text-xs font-sans-clean flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/80 border-2 border-emerald-700 text-emerald-300 text-xs font-sans-clean flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: LOGIN */}
        {mode === 'login' && (
          <div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1.5">
                  EMAIL *
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-[#f59e0b] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-pixel text-slate-300">
                    KATA SANDI *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryEmail(loginEmail);
                      switchMode('forgot_password');
                    }}
                    className="text-[10px] font-pixel text-[#f59e0b] hover:underline"
                  >
                    LUPA KATA SANDI?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-[#f59e0b] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="pixel-btn-action bg-[#f59e0b] hover:bg-amber-400 text-black font-pixel text-xs py-3 w-full border-4 border-black flex items-center justify-center gap-2 font-bold tracking-wider mt-2"
              >
                <LogIn size={16} className="text-black" />
                <span>MASUK PETUALANGAN</span>
              </button>
            </form>

            {/* Quick 1-Click Demo Logins for Instant Testing */}
            <div className="mt-5 pt-4 border-t-2 border-black/40">
              <div className="text-center font-pixel text-[9px] text-slate-400 mb-2">
                ⚡ UJI COBA CEPAT (1-KLIK MASUK)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('nuril')}
                  className="pixel-btn-action bg-[#0f172a] hover:bg-[#334155] border-2 border-black text-amber-300 text-[10px] font-pixel p-2 text-center"
                  title="Masuk sebagai Nuril Ikhsani"
                >
                  Akun Nuril 🧙‍♂️
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('demo')}
                  className="pixel-btn-action bg-[#0f172a] hover:bg-[#334155] border-2 border-black text-sky-300 text-[10px] font-pixel p-2 text-center"
                  title="Masuk sebagai Ksatria Demo"
                >
                  Akun Demo ⚔️
                </button>
              </div>
            </div>

            {/* Switch to Register */}
            <div className="mt-6 text-center text-xs font-sans-clean text-slate-400">
              Belum memiliki akun?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="text-[#f59e0b] hover:underline font-pixel text-[10px] font-bold inline-block ml-1"
              >
                DAFTAR SEKARANG &rarr;
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: REGISTER */}
        {mode === 'register' && (
          <div>
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  NAMA LENGKAP / NICKNAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ksatria Keuangan"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-[#f59e0b] focus:outline-none"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1.5">
                  PILIH AVATAR KARAKTER
                </label>
                <div className="flex gap-2 justify-center bg-[#0f172a] p-2 border-2 border-black">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setRegAvatar(av)}
                      className={`w-9 h-9 flex items-center justify-center text-lg border-2 border-black transition-all ${
                        regAvatar === av ? 'bg-[#f59e0b] scale-110 shadow-[2px_2px_0px_#000]' : 'bg-[#1e293b] hover:bg-[#334155]'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  EMAIL *
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@pikselkas.id"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-[#f59e0b] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                    KATA SANDI *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-[#f59e0b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                    KONFIRMASI *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Ulangi kata sandi"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-[#f59e0b] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="pixel-btn-action bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-xs py-3 w-full border-4 border-black flex items-center justify-center gap-2 font-bold tracking-wider mt-2"
              >
                <UserPlus size={16} />
                <span>DAFTAR AKUN SEKARANG</span>
              </button>
            </form>

            <div className="mt-5 text-center text-xs font-sans-clean text-slate-400">
              Sudah memiliki akun?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-[#f59e0b] hover:underline font-pixel text-[10px] font-bold inline-block ml-1"
              >
                MASUK DI SINI &rarr;
              </button>
            </div>
          </div>
        )}

        {/* MODE 3: FORGOT PASSWORD / PEMULIHAN KATA SANDI */}
        {mode === 'forgot_password' && (
          <div>
            {recoveryStep === 1 && (
              <form onSubmit={handleSendRecoveryOtp} className="space-y-4">
                <p className="text-xs text-slate-300 font-sans-clean">
                  Masukkan email terdaftar akun Anda. Kami akan menerbitkan token verifikasi pemulihan kata sandi.
                </p>

                <div>
                  <label className="block text-[11px] font-pixel text-slate-300 mb-1.5">
                    EMAIL TERDAFTAR *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-[#f59e0b] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="pixel-btn-action bg-[#f59e0b] hover:bg-amber-400 text-black font-pixel text-xs py-3 w-full border-4 border-black flex items-center justify-center gap-2 font-bold tracking-wider"
                >
                  <KeyRound size={16} />
                  <span>KIRIM KODE PEMULIHAN</span>
                </button>
              </form>
            )}

            {recoveryStep === 2 && (
              <form onSubmit={handleCompleteReset} className="space-y-4">
                {/* Simulated OTP Token Banner */}
                {simulatedOtpNotice && (
                  <div className="bg-[#0f172a] border-2 border-amber-500 p-3 pixel-box-sm text-center animate-pixel-float">
                    <span className="text-[10px] font-pixel text-amber-400 block mb-1">
                      🔔 KODE TOKEN PEMULIHAN ANDA (SIMULASI):
                    </span>
                    <div className="font-pixel text-xl text-emerald-400 tracking-widest my-1 select-all font-bold">
                      {simulatedOtpNotice}
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans-clean">
                      (Salin atau ketik kode di atas ke kolom di bawah)
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                    MASUKKAN KODE TOKEN (6 DIGIT) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Contoh: 123456"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-center text-sm font-pixel text-amber-300 tracking-widest focus:border-[#f59e0b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                    KATA SANDI BARU *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 karakter baru"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-[#f59e0b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                    KONFIRMASI KATA SANDI BARU *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Ulangi kata sandi baru"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-[#f59e0b] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="pixel-btn-action bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-xs py-3 w-full border-4 border-black flex items-center justify-center gap-2 font-bold tracking-wider"
                >
                  <CheckCircle2 size={16} />
                  <span>SIMPAN KATA SANDI BARU</span>
                </button>
              </form>
            )}

            {recoveryStep === 3 && (
              <div className="text-center py-4 space-y-4">
                <div className="text-4xl">🎉</div>
                <h4 className="font-pixel text-sm text-emerald-400">PEMULIHAN SUKSES!</h4>
                <p className="text-xs text-slate-300 font-sans-clean">
                  Kata sandi baru kamu telah disimpan. Sekarang kamu bisa login kembali ke petualangan keuangan.
                </p>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="pixel-btn-action bg-[#f59e0b] hover:bg-amber-400 text-black font-pixel text-xs py-3 px-6 border-4 border-black font-bold"
                >
                  LOGIN DENGAN KATA SANDI BARU &rarr;
                </button>
              </div>
            )}

            {recoveryStep !== 3 && (
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-slate-400 hover:text-white font-pixel text-[10px]"
                >
                  &larr; BATAL & KEMBALI KE LOGIN
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-[10px] text-slate-500 font-pixel">
        PikselKas Retro Engine &bull; UI/UX 8-Bit Keuangan Pribadi
      </div>
    </div>
  );
};
