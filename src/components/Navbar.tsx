import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Volume2, VolumeX, RefreshCw, UserCheck, LogOut, Radio, RadioTower } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const Navbar: React.FC = () => {
  const { session, logout, activeSosAlerts, audioEnabled, toggleAudio, resetAllData, activeGuard, broadcast, setBroadcast } = useSecurity();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0d1527]/95 backdrop-blur-md border-b border-[#1c2d54] px-4 py-2.5 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-md shadow-blue-500/20 border border-blue-400/30">
            <Shield className="w-5 h-5 text-blue-200" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0d1527]" title="System Online" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                NightGuard <span className="text-xs uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold tracking-wider">PRO</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Tactical Security & Patrol System</p>
          </div>
        </div>

        {/* Global Broadcast Marquee (if active) */}
        {broadcast && (
          <div className="hidden md:flex flex-1 max-w-md mx-2 items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs animate-pulse">
            <Radio className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="truncate">{broadcast}</span>
            <button
              onClick={() => setBroadcast(null)}
              className="ml-auto text-amber-400/80 hover:text-white text-[10px] uppercase font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Right tools and User session info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active SOS counter alert indicator */}
          {activeSosAlerts.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/60 text-red-400 text-xs font-bold animate-pulse">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{activeSosAlerts.length} SOS ACTIVE</span>
            </div>
          )}

          {/* Tactical Digital Clock */}
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 bg-[#162342] text-slate-300 rounded-lg border border-[#1c2d54]">
            <RadioTower className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>{currentTime || '00:00:00'}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleAudio}
            title={audioEnabled ? 'Siren Audio On' : 'Siren Audio Muted'}
            className={`p-2 rounded-lg border transition-colors ${
              audioEnabled
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30'
                : 'bg-[#162342] text-slate-400 border-[#1c2d54] hover:text-white'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Demo State */}
          <button
            onClick={() => {
              if (window.confirm('Reset all guards, check-ins, and SOS alerts to initial demo state?')) {
                resetAllData();
              }
            }}
            title="Reset to Initial Demo Data"
            className="p-2 rounded-lg bg-[#162342] text-slate-400 border border-[#1c2d54] hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Current User Role / Switch Button */}
          {session ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#1c2d54]">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-200">
                  {session.role === 'supervisor' ? 'Command HQ' : activeGuard?.name || 'On Duty Guard'}
                </div>
                <div className="text-[10px] text-blue-400 uppercase tracking-wider font-mono">
                  {session.role === 'supervisor' ? 'Supervisor' : activeGuard?.badgeNumber || 'Security'}
                </div>
              </div>

              <button
                onClick={logout}
                title="Switch Role / Logout"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[#162342] hover:bg-red-950/40 text-slate-300 hover:text-red-300 border border-[#1c2d54] hover:border-red-800/50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Switch</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Select Access Mode</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
