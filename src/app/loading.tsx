"use client";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Soft background glow */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#d4a017]/5 blur-[80px] pointer-events-none animate-pulse" />
      
      <div className="text-center space-y-6 relative z-10 flex flex-col items-center">
        {/* Divine Loader Animation */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Golden outer spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-[#795900]/10" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#795900] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          
          {/* Inner pulsing ring */}
          <div className="absolute inset-2 rounded-full border-2 border-[#8f4e00]/20 animate-ping [animation-duration:2s]" />
          <div className="absolute inset-3 rounded-full border border-[#795900]/20 animate-pulse" />
          
          {/* Central Devotional Symbol */}
          <span className="material-symbols-outlined text-[#795900] text-4xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
            spa
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#795900] tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
            SacredSamskara
          </h2>
          <p className="text-xs text-[#4f4634] uppercase tracking-widest font-semibold animate-pulse">
            Loading Spiritual Blessings...
          </p>
        </div>
      </div>
    </div>
  );
}
