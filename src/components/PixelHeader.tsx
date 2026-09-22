import React, { useState } from 'react';
import { User } from '../types';
import { retroSound } from '../utils/sound';
import { Volume2, VolumeX, LogOut, RotateCcw } from 'lucide-react';
import { PixelIcon } from './PixelIcon';

interface PixelHeaderProps {
  user: User;
  onLogout: () => void;
  onResetDemo: () => void;
}

export const PixelHeader: React.FC<PixelHeaderProps> = ({ user, onLogout, onResetDemo }) => {
  const [isMuted, setIsMuted] = useState(retroSound.getMuted());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleToggleSound = () => {
    const next = retroSound.toggleMute();
    setIsMuted(next);
  };

  const confirmLogoutAction = () => {
    retroSound.playClick();
    setShowLogoutConfirm(false);
    onLogout();
  };

  const confirmResetAction = () => {
    retroSound.playWarning();
    setShowResetConfirm(false);
    onResetDemo();
  };

  return (
    <>
      <header className="bg-[#0b1120] border-b-4 border-black sticky top-0 z-40 px-3 sm:px-6 py-3 shadow-[0_4px_0_0_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#f59e0b] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] shrink-0">
              <PixelIcon name="coin" size={24} className="animate-coin-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-sm sm:text-lg text-[#f59e0b] tracking-wider drop-shadow-[2px_2px_0px_#000]">
                  PIKSELKAS
                </span>
                <span className="hidden sm:inline-block bg-[#10b981] text-black font-pixel text-[9px] px-1.5 py-0.5 border border-black uppercase font-bold">
                  v1.0 RETRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-pixel hidden sm:block">
                Pencatatan Keuangan & Outstanding Piutang
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              className="pixel-btn-action bg-[#1e293b] hover:bg-[#334155] border-2 border-black text-slate-200 p-2 text-xs flex items-center gap-1.5"
              title={isMuted ? 'Nyalakan Suara 8-Bit' : 'Matikan Suara 8-Bit'}
            >
              {isMuted ? <VolumeX size={16} className="text-rose-400" /> : <Volume2 size={16} className="text-amber-400" />}
              <span className="hidden md:inline font-pixel text-[10px]">
                {isMuted ? 'MUTE' : '8-BIT FX'}
              </span>
            </button>

            {/* Reset Demo Data button */}
            <button
              onClick={() => {
                retroSound.playClick();
                setShowResetConfirm(true);
              }}
              className="pixel-btn-action bg-[#334155] hover:bg-[#475569] border-2 border-black text-slate-200 p-2 text-xs hidden lg:flex items-center gap-1.5"
              title="Reset data demo kembali ke awal"
            >
              <RotateCcw size={14} className="text-sky-300" />
              <span className="font-pixel text-[10px]">RESET DATA</span>
            </button>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2 bg-[#1e293b] border-2 border-black px-2.5 py-1.5 shadow-[2px_2px_0px_#000]">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#0f172a] border border-black flex items-center justify-center text-sm">
                {user.avatar || '🧙‍♂️'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-200 truncate max-w-[120px] font-sans-clean">
                  {user.name}
                </div>
                <div className="text-[9px] text-amber-400 font-pixel">
                  GOLD MEMBER
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                retroSound.playClick();
                setShowLogoutConfirm(true);
              }}
              className="pixel-btn-action bg-rose-600 hover:bg-rose-500 text-white border-2 border-black px-2.5 sm:px-3 py-1.5 text-xs flex items-center gap-1.5"
              title="Keluar dari akun"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline font-pixel text-[10px]">KELUAR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Pixel Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border-4 border-black p-5 sm:p-6 max-w-sm w-full pixel-card relative animate-pixel-float">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🚪</span>
              <h3 className="font-pixel text-sm text-amber-400">KONFIRMASI KELUAR</h3>
            </div>
            <p className="text-sm text-slate-300 font-sans-clean mb-6">
              Apakah kamu yakin ingin keluar dari petualangan keuangan ini? Sesi saat ini akan ditutup.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  retroSound.playClick();
                  setShowLogoutConfirm(false);
                }}
                className="pixel-btn-action bg-slate-700 hover:bg-slate-600 text-slate-200 font-pixel text-xs px-4 py-2 border-2 border-black"
              >
                BATAL
              </button>
              <button
                onClick={confirmLogoutAction}
                className="pixel-btn-action bg-rose-600 hover:bg-rose-500 text-white font-pixel text-xs px-4 py-2 border-2 border-black"
              >
                YA, KELUAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Pixel Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border-4 border-black p-5 sm:p-6 max-w-md w-full pixel-card relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🔄</span>
              <h3 className="font-pixel text-sm text-amber-400">RESET DATA DEMO</h3>
            </div>
            <p className="text-sm text-slate-300 font-sans-clean mb-6">
              Semua data piutang, transaksi, dan pos keuangan akan dikembalikan ke setelan awal demo. Lanjutkan?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  retroSound.playClick();
                  setShowResetConfirm(false);
                }}
                className="pixel-btn-action bg-slate-700 hover:bg-slate-600 text-slate-200 font-pixel text-xs px-4 py-2 border-2 border-black"
              >
                BATAL
              </button>
              <button
                onClick={confirmResetAction}
                className="pixel-btn-action bg-amber-500 hover:bg-amber-400 text-black font-pixel text-xs px-4 py-2 border-2 border-black font-bold"
              >
                RESET SEKARANG
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
