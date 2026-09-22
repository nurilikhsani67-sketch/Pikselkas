import React, { useState } from 'react';
import { retroSound } from '../utils/sound';

interface PixelMascotProps {
  overdueCount: number;
  healthPercent: number;
  totalReceivablesRemaining: number;
  overdueDebtsCount?: number;
  totalDebtsRemaining?: number;
}

export const PixelMascot: React.FC<PixelMascotProps> = ({
  overdueCount,
  healthPercent,
  totalReceivablesRemaining,
  overdueDebtsCount = 0,
  totalDebtsRemaining = 0,
}) => {
  const [speechIndex, setSpeechIndex] = useState(0);

  const getCustomMessage = () => {
    if (overdueDebtsCount > 0) {
      return `⚠️ Gawat! Ada ${overdueDebtsCount} utang yang lewat jatuh tempo. Segera bayar di menu 'Utang' agar reputasimu tetap aman!`;
    }
    if (overdueCount > 0) {
      return `⚠️ Ada ${overdueCount} piutang lewat jatuh tempo! Klik tab 'Piutang' untuk kirim pengingat ramah.`;
    }
    if (totalDebtsRemaining > 0) {
      return `💳 Kamu punya tanggungan utang aktif. Pantau jadwal jatuh tempo dan cicil secara berkala!`;
    }
    if (totalReceivablesRemaining > 0) {
      return `📜 Kamu punya piutang aktif yang bisa ditagih. Terus pantau agar kas tetap stabil!`;
    }
    if (healthPercent >= 75) {
      return `✨ Luar biasa! Kesehatan keuanganmu di level ${healthPercent}%. Pertahankan surplus kas!`;
    }
    if (healthPercent < 40) {
      return `🛡️ Waspada, pengeluaran mulai mendekati batas! Tahan jajan yang belum mendesak.`;
    }
    return `💰 Tips Petualang: Sisihkan minimal 20% penghasilan ke pos 'Tabungan Quest'!`;
  };

  const extraTips = [
    getCustomMessage(),
    '💡 Saat melunasi utang, sistem akan memberikan tanda [SUDAH TERBAYAR LUNAS] dengan badge berkilau!',
    '🪙 Jangan ragu mencatat pelunasan bertahap (cicilan) di menu Utang/Piutang agar sisa tanggungan selalu akurat.',
    '⚔️ Alokasikan dana darurat setara 3-6 bulan pengeluaran untuk perisai hidupmu!',
  ];

  const handleMascotClick = () => {
    retroSound.playCoin();
    setSpeechIndex((prev) => (prev + 1) % extraTips.length);
  };

  return (
    <div 
      onClick={handleMascotClick}
      className="cursor-pointer bg-[#1e293b]/90 border-2 border-[#334155] p-3 md:p-4 rounded-none pixel-box relative flex items-start sm:items-center gap-3 md:gap-4 select-none hover:border-[#f59e0b] transition-colors"
      title="Klik maskot untuk tips keuangan berikutnya!"
    >
      {/* Pixel Character Avatar */}
      <div className="shrink-0 relative">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-[#0f172a] border-2 border-black flex items-center justify-center animate-pixel-float relative shadow-[2px_2px_0px_#000]">
          {/* Pixel Character Mini Sprite */}
          <div className="text-2xl md:text-3xl">🧙‍♂️</div>
          <span className="absolute -bottom-1 -right-1 bg-[#f59e0b] text-black text-[9px] font-pixel px-1 border border-black font-bold">
            LV.9
          </span>
        </div>
      </div>

      {/* Speech Bubble */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-pixel text-[10px] md:text-xs text-[#f59e0b] tracking-wider uppercase">
            Penasihat Koin (Klik aku!)
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 border border-slate-700 font-pixel">
            TIP #{speechIndex + 1}
          </span>
        </div>
        <p className="text-xs md:text-sm text-slate-200 font-sans-clean leading-snug">
          {extraTips[speechIndex]}
        </p>
      </div>

      {/* Retro indicator */}
      <div className="hidden sm:flex flex-col items-center justify-center text-[#f59e0b] text-xs font-pixel shrink-0 animate-pulse">
        <span>▶</span>
      </div>
    </div>
  );
};
