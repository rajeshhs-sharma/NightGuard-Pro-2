import React, { useState } from 'react';
import { Shield, ShieldAlert, Radio, UserCheck, Lock, ChevronRight, CheckCircle2, User, KeyRound } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const LoginView: React.FC = () => {
  const { guards, login } = useSecurity();
  const [selectedRole, setSelectedRole] = useState<'guard' | 'supervisor'>('guard');
  const [selectedGuardId, setSelectedGuardId] = useState<string>(guards[0]?.id || 'guard-101');
  const [customGuardName, setCustomGuardName] = useState<string>('');
  const [customBadge, setCustomBadge] = useState<string>('');
  const [supervisorPasscode, setSupervisorPasscode] = useState<string>('9942');
  const [showCustomGuardForm, setShowCustomGuardForm] = useState<boolean>(false);

  const handleGuardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (showCustomGuardForm) {
      if (!customGuardName.trim()) return;
      // In this case, log in as first guard but update name or choose default
      login({
        role: 'guard',
        guardId: selectedGuardId,
      });
    } else {
      login({
        role: 'guard',
        guardId: selectedGuardId,
      });
    }
  };

  const handleSupervisorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      role: 'supervisor',
      supervisorName: 'Commander Robert Vance',
    });
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl">
        {/* App Title & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 shadow-xl shadow-blue-500/20 border border-blue-400/30 mb-4">
            <Shield className="w-9 h-9 text-blue-200" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            NightGuard <span className="text-blue-400">PRO</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Tactical Security Guard Patrol & Emergency Command System
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div className="bg-[#0d1527] border border-[#1c2d54] p-1.5 rounded-2xl flex gap-1 mb-6 shadow-xl shadow-black/50">
          <button
            type="button"
            onClick={() => setSelectedRole('guard')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
              selectedRole === 'guard'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#162342]/50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Guard Mobile App</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('supervisor')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
              selectedRole === 'supervisor'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#162342]/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Supervisor Console</span>
          </button>
        </div>

        {/* Role Content Card */}
        <div className="bg-[#0d1527] border border-[#1c2d54] rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black/60 relative overflow-hidden">
          {/* Subtle grid backdrop decoration */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

          {selectedRole === 'guard' ? (
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1c2d54]">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-400" />
                    Select Guard Profile
                  </h2>
                  <p className="text-xs text-slate-400">Choose your assigned shift profile to begin patrol</p>
                </div>
                <span className="text-[11px] font-mono uppercase bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                  {guards.length} On Roster
                </span>
              </div>

              {!showCustomGuardForm ? (
                <div className="space-y-2.5 mb-6">
                  {guards.map(guard => {
                    const isSelected = selectedGuardId === guard.id;
                    const isSos = guard.status === 'sos';
                    return (
                      <div
                        key={guard.id}
                        onClick={() => setSelectedGuardId(guard.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#162342] border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500'
                            : 'bg-[#111b33]/60 border-[#1c2d54] hover:bg-[#162342]/70 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={guard.avatar}
                              alt={guard.name}
                              className="w-11 h-11 rounded-xl object-cover border border-[#2d4b8a]"
                            />
                            {isSos ? (
                              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#0d1527] animate-ping" />
                            ) : (
                              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0d1527]" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-white">{guard.name}</span>
                              <span className="text-[11px] font-mono px-1.5 py-0.2 bg-[#070c18] text-slate-300 rounded border border-[#1c2d54]">
                                {guard.badgeNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span className="text-blue-300 font-medium">{guard.assignedSector}</span>
                              <span>•</span>
                              <span>{guard.currentZone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Guard Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={customGuardName}
                        onChange={e => setCustomGuardName(e.target.value)}
                        placeholder="e.g. Officer Nathan Ross"
                        className="w-full bg-[#111b33] border border-[#1c2d54] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Badge ID</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={customBadge}
                        onChange={e => setCustomBadge(e.target.value)}
                        placeholder="e.g. NG-1150"
                        className="w-full bg-[#111b33] border border-[#1c2d54] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs mb-5">
                <button
                  type="button"
                  onClick={() => setShowCustomGuardForm(!showCustomGuardForm)}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  {showCustomGuardForm ? '← Pick from active roster' : '+ Enter custom badge details'}
                </button>
                <span className="text-slate-500 text-[11px]">Local session only</span>
              </div>

              <button
                type="button"
                onClick={handleGuardLogin}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>Launch Guard Interface</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSupervisorLogin}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1c2d54]">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    Security Supervisor Access
                  </h2>
                  <p className="text-xs text-slate-400">Live monitoring, SOS alert dispatcher & patrol management</p>
                </div>
                <span className="text-[11px] font-mono uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                  HQ Level 4
                </span>
              </div>

              {/* Supervisor Info Card */}
              <div className="p-4 rounded-xl bg-[#111b33]/80 border border-[#1c2d54] mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-900/60 border border-blue-400/40 flex items-center justify-center text-blue-200">
                    <Radio className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Capt. Robert Vance</div>
                    <div className="text-xs text-slate-400">Chief Watch Commander • Shift Night #2</div>
                    <div className="text-[11px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      All Dispatch Channels Active
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Supervisor Authorization PIN
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={supervisorPasscode}
                    onChange={e => setSupervisorPasscode(e.target.value)}
                    placeholder="Enter PIN (Demo: 9942)"
                    className="w-full bg-[#111b33] border border-[#1c2d54] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono tracking-widest"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Pre-filled with demo supervisor PIN: 9942</p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>Enter Command Console</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Tactical Info Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
          <span>• Real-time Patrol Logging</span>
          <span>• Emergency SOS Beacon</span>
          <span>• Offline LocalStorage</span>
        </div>
      </div>
    </div>
  );
};
