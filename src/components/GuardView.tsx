import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  MapPin,
  Clock,
  BatteryCharging,
  Radio,
  Flashlight,
  FileText,
  AlertCircle,
  ChevronDown,
  Navigation,
  Check,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { CHECKPOINTS } from '../mockData';
import { SosAlert, GuardStatus } from '../types';
import { IncidentModal } from './IncidentModal';

export const GuardView: React.FC = () => {
  const {
    activeGuard,
    checkIn,
    triggerSOS,
    cancelSOS,
    updateStatus,
    addIncident,
    checkIns,
    broadcast,
  } = useSecurity();

  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>(
    activeGuard?.currentZone || CHECKPOINTS[0].name
  );
  const [checkInNote, setCheckInNote] = useState<string>('');
  const [showCheckInModal, setShowCheckInModal] = useState<boolean>(false);
  const [showSosModal, setShowSosModal] = useState<boolean>(false);
  const [sosNature, setSosNature] = useState<SosAlert['nature']>('panic');
  const [sosDescription, setSosDescription] = useState<string>('');
  const [showIncidentModal, setShowIncidentModal] = useState<boolean>(false);
  const [torchActive, setTorchActive] = useState<boolean>(false);
  const [timeUntilDue, setTimeUntilDue] = useState<string>('30m 00s');
  const [isOverdue, setIsOverdue] = useState<boolean>(false);
  const [shiftSeconds, setShiftSeconds] = useState<number>(3600 * 3 + 1420); // 3h 23m initial shift elapsed

  // Shift timer & Due countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setShiftSeconds(prev => prev + 1);

      if (activeGuard?.nextCheckInDue) {
        const dueTime = new Date(activeGuard.nextCheckInDue).getTime();
        const now = Date.now();
        const diffMs = dueTime - now;

        if (diffMs <= 0) {
          setIsOverdue(true);
          const overdueSec = Math.floor(Math.abs(diffMs) / 1000);
          const mins = Math.floor(overdueSec / 60);
          const secs = overdueSec % 60;
          setTimeUntilDue(`OVERDUE (${mins}m ${secs}s)`);
        } else {
          setIsOverdue(false);
          const totalSec = Math.floor(diffMs / 1000);
          const mins = Math.floor(totalSec / 60);
          const secs = totalSec % 60;
          setTimeUntilDue(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeGuard?.nextCheckInDue]);

  if (!activeGuard) {
    return (
      <div className="p-8 text-center text-slate-400">
        No active guard session found. Please switch user to select a guard profile.
      </div>
    );
  }

  const isSos = activeGuard.status === 'sos';

  // Format shift elapsed
  const formatShiftTime = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hours}h ${mins < 10 ? '0' : ''}${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handlePerformCheckIn = () => {
    checkIn(selectedCheckpoint, checkInNote.trim() || undefined);
    setCheckInNote('');
    setShowCheckInModal(false);
  };

  const handleTriggerSOS = () => {
    triggerSOS(sosNature, sosDescription || 'EMERGENCY: Immediate guard assistance requested!');
    setShowSosModal(false);
  };

  // Filter checkins for this guard
  const myRecentCheckIns = checkIns
    .filter(ci => ci.guardId === activeGuard.id)
    .slice(0, 5);

  return (
    <div className={`min-h-[calc(100vh-65px)] pb-16 transition-colors duration-300 ${torchActive ? 'bg-slate-100 text-slate-900' : 'bg-[#070c18] text-slate-100'}`}>
      {/* Broadcast alert marquee if active */}
      {broadcast && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-2 text-center text-amber-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2">
          <Radio className="w-4 h-4 animate-pulse shrink-0" />
          <span>SUPERVISOR BROADCAST: {broadcast}</span>
        </div>
      )}

      {/* SOS Active Emergency Warning Banner */}
      {isSos && (
        <div className="bg-red-600/90 text-white px-4 py-3 border-b-2 border-red-400 shadow-xl shadow-red-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-red-600 rounded-xl">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base tracking-wide uppercase">
                EMERGENCY SOS SIGNAL ACTIVE
              </div>
              <div className="text-xs text-red-100">
                Command Center notified with your live coordinates. Stand by or cancel if accidental.
              </div>
            </div>
          </div>
          <button
            onClick={cancelSOS}
            className="w-full sm:w-auto px-4 py-2 bg-white text-red-700 hover:bg-red-50 text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Cancel SOS (False Alarm)</span>
          </button>
        </div>
      )}

      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Guard Profile & Tactical Status Bar */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          torchActive ? 'bg-white border-slate-300 shadow-md' : 'bg-[#0d1527] border-[#1c2d54] shadow-xl shadow-black/40'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src={activeGuard.avatar}
                  alt={activeGuard.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500/40 shadow"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${
                    torchActive ? 'border-white' : 'border-[#0d1527]'
                  } ${
                    isSos ? 'bg-red-500 animate-ping' : 'bg-emerald-500'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`text-lg sm:text-xl font-bold tracking-tight ${torchActive ? 'text-slate-900' : 'text-white'}`}>
                    {activeGuard.name}
                  </h1>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    torchActive ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-[#162342] text-blue-400 border-[#1c2d54]'
                  }`}>
                    {activeGuard.badgeNumber}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mt-1">
                  <span className={torchActive ? 'text-slate-600 font-medium' : 'text-slate-400'}>
                    Sector: <strong className="text-blue-500">{activeGuard.assignedSector}</strong>
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className={`flex items-center gap-1 ${torchActive ? 'text-slate-600' : 'text-slate-400'}`}>
                    <Radio className="w-3.5 h-3.5 text-blue-400" />
                    {activeGuard.radioChannel}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <BatteryCharging className="w-3.5 h-3.5" />
                    {activeGuard.batteryLevel}% Battery
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Pill / Duty Mode Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-[#111b33] p-1 rounded-xl border border-[#1c2d54]">
                {(['on-duty', 'patrolling', 'break'] as GuardStatus[]).map(statusOption => {
                  const isActive = activeGuard.status === statusOption;
                  return (
                    <button
                      key={statusOption}
                      onClick={() => updateStatus(statusOption)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {statusOption.replace('-', ' ')}
                    </button>
                  );
                })}
              </div>

              {/* Flashlight toggle */}
              <button
                onClick={() => setTorchActive(!torchActive)}
                title="Tactical Screen Flashlight"
                className={`p-2.5 rounded-xl border transition-all ${
                  torchActive
                    ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-md font-bold'
                    : 'bg-[#162342] text-slate-300 border-[#1c2d54] hover:text-white'
                }`}
              >
                <Flashlight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Big Action Center: BIG SOS BUTTON & CHECK-IN BUTTON */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. BIG EMERGENCY SOS BUTTON */}
          <div className="bg-[#0d1527] border border-[#1c2d54] rounded-2xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-2xl">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-extrabold tracking-wider text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Emergency Protocol
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Channel 01 Duress</span>
            </div>

            <div className="py-2 my-auto">
              {/* Massive tactile SOS button */}
              <button
                type="button"
                onClick={() => (isSos ? cancelSOS() : setShowSosModal(true))}
                className={`w-44 h-44 sm:w-48 sm:h-48 rounded-full flex flex-col items-center justify-center font-black tracking-widest transition-all transform active:scale-95 cursor-pointer shadow-2xl select-none ${
                  isSos
                    ? 'bg-gradient-to-b from-red-600 via-red-700 to-red-900 text-white animate-sos-pulse border-4 border-white'
                    : 'bg-gradient-to-b from-red-500 via-red-600 to-red-800 hover:from-red-600 hover:to-red-900 text-white border-4 border-red-400/40 shadow-red-600/40 hover:shadow-red-600/60'
                }`}
              >
                <ShieldAlert className="w-12 h-12 mb-1 text-red-100" />
                <span className="text-3xl font-black">SOS</span>
                <span className="text-[11px] font-semibold tracking-normal mt-1 opacity-90">
                  {isSos ? 'TAP TO ABORT' : 'PRESS FOR HELP'}
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-4 max-w-xs">
              Instantly transmits your exact sector location to the Supervisor Command Console & triggers sirens.
            </p>
          </div>

          {/* 2. PROMINENT CHECK-IN BUTTON & NEXT SCHEDULE TIMER */}
          <div className="bg-[#0d1527] border border-[#1c2d54] rounded-2xl p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-extrabold tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4" />
                  Patrol Verification
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Interval 30m</span>
              </div>

              {/* Status Display: Current location + Next check-in countdown */}
              <div className="bg-[#111b33] p-4 rounded-xl border border-[#1c2d54] mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Current Checkpoint:</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    {activeGuard.currentZone}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1c2d54]">
                  <span className="text-xs text-slate-400">Next Check-in:</span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isOverdue
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {timeUntilDue}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1c2d54]">
                  <span className="text-xs text-slate-400">Shift Elapsed:</span>
                  <span className="text-xs font-mono text-slate-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatShiftTime(shiftSeconds)}
                  </span>
                </div>
              </div>
            </div>

            {/* Check-in Trigger Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowCheckInModal(true)}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] text-base"
              >
                <CheckCircle className="w-5 h-5 text-emerald-100" />
                <span>CHECK-IN AT CHECKPOINT</span>
              </button>

              <button
                type="button"
                onClick={() => setShowIncidentModal(true)}
                className="w-full py-2.5 px-4 bg-[#162342] hover:bg-[#1c2d54] text-slate-300 hover:text-white rounded-xl border border-[#1c2d54] font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Log Security Incident / Observation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Status Summary & Recent Check-in Activity */}
        <div className="bg-[#0d1527] border border-[#1c2d54] rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1c2d54]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Your Shift Check-in Timeline
            </h2>
            <span className="text-xs text-slate-400">Total Check-ins: {myRecentCheckIns.length}</span>
          </div>

          {myRecentCheckIns.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No check-ins recorded yet for this shift. Tap &ldquo;Check-in at Checkpoint&rdquo; above.
            </div>
          ) : (
            <div className="space-y-2.5">
              {myRecentCheckIns.map((item, idx) => {
                const date = new Date(item.timestamp);
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#111b33]/60 border border-[#1c2d54] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-white">{item.zone}</span>
                        {item.note && <p className="text-slate-400 text-[11px] mt-0.5">{item.note}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] sm:self-center">
                      <span>{timeStr}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {idx === 0 ? 'Latest' : 'Verified'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* CHECK-IN DIALOG MODAL */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0d1527] border border-[#1c2d54] rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1c2d54]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Record Checkpoint Check-in</h3>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Checkpoint Arrived</label>
                <select
                  value={selectedCheckpoint}
                  onChange={e => setSelectedCheckpoint(e.target.value)}
                  className="w-full bg-[#111b33] border border-[#1c2d54] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {CHECKPOINTS.map(cp => (
                    <option key={cp.id} value={cp.name}>
                      {cp.code}: {cp.name} ({cp.sector})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Patrol Note / Observations (Optional)
                </label>
                <input
                  type="text"
                  value={checkInNote}
                  onChange={e => setCheckInNote(e.target.value)}
                  placeholder="e.g. Doors secured, perimeter clear"
                  className="w-full bg-[#111b33] border border-[#1c2d54] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                Check-in confirms your physical presence and resets the 30-minute overdue alert for HQ.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCheckInModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#162342] border border-[#1c2d54]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePerformCheckIn}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Check-in</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOS CONFIRMATION & CATEGORY MODAL */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0d1527] border-2 border-red-500/80 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center mx-auto mb-3 text-red-500 animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-white">TRIGGER EMERGENCY SOS</h3>
              <p className="text-xs text-red-300 mt-1">
                This triggers a priority red alert on the Supervisor Console.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Nature of Emergency</label>
                <select
                  value={sosNature}
                  onChange={e => setSosNature(e.target.value as SosAlert['nature'])}
                  className="w-full bg-[#111b33] border border-red-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-semibold"
                >
                  <option value="panic">Duress / Immediate Danger</option>
                  <option value="breach">Perimeter Breach / Intruder</option>
                  <option value="altercation">Physical Altercation / Violence</option>
                  <option value="medical">Medical Emergency</option>
                  <option value="fire">Fire / Hazardous Material</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Quick Situation Description</label>
                <input
                  type="text"
                  value={sosDescription}
                  onChange={e => setSosDescription(e.target.value)}
                  placeholder="e.g. Unidentified individual refusing to vacate"
                  className="w-full bg-[#111b33] border border-[#1c2d54] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="text-[11px] text-slate-400">
                Location transmitted: <span className="font-bold text-white">{activeGuard.currentZone}</span> ({activeGuard.assignedSector})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="py-3 rounded-xl text-xs font-semibold text-slate-300 bg-[#162342] border border-[#1c2d54] hover:bg-[#1c2d54]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerSOS}
                className="py-3 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/40 uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>BROADCAST SOS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incident Modal */}
      <IncidentModal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
        onSubmit={addIncident}
        defaultZone={activeGuard.currentZone}
      />
    </div>
  );
};
