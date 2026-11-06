import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Clock,
  Radio,
  Send,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BatteryCharging,
  RadioTower,
  Eye,
  Megaphone,
  BellRing
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { CHECKPOINTS } from '../mockData';
import { Guard, SosAlert } from '../types';
import { TacticalMap } from './TacticalMap';

export const SupervisorView: React.FC = () => {
  const {
    guards,
    sosAlerts,
    activeSosAlerts,
    acknowledgeSOS,
    resolveSOS,
    dispatchBackup,
    broadcast,
    setBroadcast,
    incidents,
  } = useSecurity();

  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [selectedGuard, setSelectedGuard] = useState<Guard | null>(null);
  const [resolveNoteModal, setResolveNoteModal] = useState<SosAlert | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Update relative timer every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter guards based on sector and search query
  const filteredGuards = guards.filter(guard => {
    const matchesSector = selectedSector === 'All' || guard.assignedSector.includes(selectedSector);
    const matchesSearch =
      guard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guard.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guard.currentZone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcast(broadcastMessage.trim());
    setBroadcastMessage('');
  };

  const handleConfirmResolve = () => {
    if (!resolveNoteModal) return;
    resolveSOS(resolveNoteModal.id, resolutionNote.trim() || undefined);
    setResolveNoteModal(null);
    setResolutionNote('');
  };

  // Helper to format time elapsed
  const getElapsedMinutes = (isoString: string) => {
    const diffMs = currentTime - new Date(isoString).getTime();
    const mins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    if (mins < 1) return 'Just now';
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      return `${hours}h ${mins % 60}m ago`;
    }
    return `${mins}m ago`;
  };

  // Helper to check if a guard is overdue
  const isGuardOverdue = (guard: Guard) => {
    if (guard.status === 'sos') return false;
    const dueTime = new Date(guard.nextCheckInDue).getTime();
    return currentTime > dueTime;
  };

  const overdueCount = guards.filter(isGuardOverdue).length;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#070c18] pb-16">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* 1. SOS ALERTS IN RED: HIGH PRIORITY BANNER */}
        {activeSosAlerts.length > 0 ? (
          <div className="bg-red-950/80 border-2 border-red-500 rounded-2xl p-5 shadow-2xl shadow-red-900/60 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-red-800/60">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-600 text-white rounded-xl shadow-lg shadow-red-600/40">
                  <ShieldAlert className="w-7 h-7 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
                    <span>EMERGENCY SOS ALERT ACTIVATED</span>
                    <span className="text-xs bg-red-600 px-2 py-0.5 rounded text-white font-mono uppercase">
                      {activeSosAlerts.length} Active
                    </span>
                  </h2>
                  <p className="text-xs text-red-200">
                    Immediate security intervention required. Dispatch units and verify sector safety.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-red-300 flex items-center gap-1.5">
                  <BellRing className="w-4 h-4 text-red-400 animate-spin" />
                  Live Siren Active
                </span>
              </div>
            </div>

            {/* List of active SOS alerts */}
            <div className="space-y-3">
              {activeSosAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="bg-[#1a0f18] border border-red-500/70 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500 flex items-center justify-center text-red-400 font-bold shrink-0">
                      SOS
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-white text-base">{alert.guardName}</span>
                        <span className="text-xs font-mono bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800">
                          {alert.badgeNumber}
                        </span>
                        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                          {alert.nature}
                        </span>
                        {alert.status === 'acknowledged' && (
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Acknowledged by HQ
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-red-200 mt-1">
                        <span className="flex items-center gap-1 font-semibold text-white">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          {alert.zone}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{getElapsedMinutes(alert.timestamp)}</span>
                        <span>•</span>
                        <span className="italic text-red-300">&ldquo;{alert.description}&rdquo;</span>
                      </div>
                    </div>
                  </div>

                  {/* Immediate Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {alert.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => acknowledgeSOS(alert.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center gap-1.5 shadow"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => dispatchBackup(alert.guardId)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow"
                    >
                      <RadioTower className="w-4 h-4" />
                      <span>Dispatch Backup</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setResolveNoteModal(alert)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resolve & Clear SOS</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#0d1527] border border-[#1c2d54] rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">All Checkpoint Sectors Secure</h3>
                <p className="text-xs text-slate-400">No active SOS alerts. Perimeter sensors & guards nominal.</p>
              </div>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              STATUS: NOMINAL
            </div>
          </div>
        )}

        {/* Command Center Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#0d1527] border border-[#1c2d54] p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Total On Shift</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{guards.length} Guards</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Full deployment active</div>
          </div>

          <div className="bg-[#0d1527] border border-[#1c2d54] p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Patrolling</span>
              <Radio className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {guards.filter(g => g.status === 'patrolling' || g.status === 'on-duty').length}
            </div>
            <div className="text-[11px] text-cyan-400 mt-0.5">Radio channels active</div>
          </div>

          <div className="bg-[#0d1527] border border-[#1c2d54] p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Overdue Patrols</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className={`text-2xl font-black ${overdueCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {overdueCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Threshold &gt; 30 mins</div>
          </div>

          <div className="bg-[#0d1527] border border-[#1c2d54] p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Active Incidents</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {activeSosAlerts.length + incidents.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Logs in current shift</div>
          </div>
        </div>

        {/* 2. TACTICAL SECTOR MAP VIEW */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              Perimeter Tactical Map & Live Guard Positions
            </h2>
            <span className="text-xs text-slate-400">Click any guard pin to inspect status</span>
          </div>

          <TacticalMap
            guards={guards}
            checkpoints={CHECKPOINTS}
            activeSosAlerts={activeSosAlerts}
            onSelectGuard={setSelectedGuard}
            selectedGuardId={selectedGuard?.id}
          />
        </div>

        {/* 3. SUPERVISOR BROADCAST BAR */}
        <div className="bg-[#0d1527] border border-[#1c2d54] p-4 rounded-2xl shadow-lg">
          <form onSubmit={handleSendBroadcast} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-blue-400 shrink-0">
              <Megaphone className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Radio Broadcast to Guards:
              </span>
            </div>
            <input
              type="text"
              value={broadcastMessage}
              onChange={e => setBroadcastMessage(e.target.value)}
              placeholder="Type urgent shift instruction or perimeter update to all guard terminals..."
              className="flex-1 w-full bg-[#111b33] border border-[#1c2d54] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Transmit</span>
            </button>
            {broadcast && (
              <button
                type="button"
                onClick={() => setBroadcast(null)}
                className="w-full sm:w-auto px-3 py-2 bg-[#162342] hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-[#1c2d54]"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* 4. LIST OF ALL GUARDS (TABLE & DETAILED CARDS) */}
        <div className="bg-[#0d1527] border border-[#1c2d54] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header controls: Search & Sector filter */}
          <div className="p-4 sm:p-5 border-b border-[#1c2d54] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Active Guard Roster & Patrol Monitoring
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time check-in timestamps, assigned sectors, and live duress alerts
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search box */}
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search guard, zone, badge..."
                  className="w-full bg-[#111b33] border border-[#1c2d54] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                />
              </div>

              {/* Sector Filter */}
              <div className="flex items-center gap-1 bg-[#111b33] p-1 rounded-xl border border-[#1c2d54] text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                {['All', 'Alpha', 'Bravo', 'Charlie', 'Delta'].map(sector => (
                  <button
                    key={sector}
                    onClick={() => setSelectedSector(sector)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedSector === sector
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Guards Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1c2d54] bg-[#111b33]/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Guard / Officer</th>
                  <th className="py-3 px-4">Current Location</th>
                  <th className="py-3 px-4">Assigned Sector</th>
                  <th className="py-3 px-4">Last Check-In Time</th>
                  <th className="py-3 px-4">Next Check-In Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2d54]">
                {filteredGuards.map(guard => {
                  const isSos = guard.status === 'sos';
                  const isOverdue = isGuardOverdue(guard);
                  const lastCheckInFormatted = new Date(guard.lastCheckInTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr
                      key={guard.id}
                      className={`hover:bg-[#162342]/40 transition-colors ${
                        isSos ? 'bg-red-950/30' : isOverdue ? 'bg-amber-950/20' : ''
                      }`}
                    >
                      {/* Guard Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={guard.avatar}
                              alt={guard.name}
                              className="w-10 h-10 rounded-xl object-cover border border-[#2d4b8a]"
                            />
                            {isSos ? (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0d1527] animate-ping" />
                            ) : (
                              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0d1527]" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-1.5">
                              {guard.name}
                            </div>
                            <div className="text-slate-400 text-[11px] font-mono flex items-center gap-2">
                              <span>{guard.badgeNumber}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5 text-emerald-400">
                                <BatteryCharging className="w-3 h-3" />
                                {guard.batteryLevel}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{guard.currentZone}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Radio className="w-3 h-3 text-slate-500" />
                          <span>{guard.radioChannel}</span>
                        </div>
                      </td>

                      {/* Sector */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 font-semibold border border-blue-500/20 text-[11px]">
                          {guard.assignedSector}
                        </span>
                      </td>

                      {/* Last Check-in */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-white text-xs font-semibold">
                          {lastCheckInFormatted}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {getElapsedMinutes(guard.lastCheckInTime)}
                        </div>
                      </td>

                      {/* Next Check-in Due */}
                      <td className="py-3 px-4">
                        {isSos ? (
                          <span className="text-red-400 font-bold uppercase text-[11px]">Duress Priority</span>
                        ) : isOverdue ? (
                          <div className="flex items-center gap-1 text-red-400 font-bold font-mono">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                            <span>OVERDUE CHECK-IN</span>
                          </div>
                        ) : (
                          <div className="font-mono text-slate-300 text-xs">
                            {new Date(guard.nextCheckInDue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isSos ? (
                          <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-extrabold uppercase text-[10px] tracking-wider flex items-center gap-1 w-max animate-pulse">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            SOS ALERT
                          </span>
                        ) : isOverdue ? (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase text-[10px] w-max">
                            Check-in Overdue
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold capitalize text-[11px] w-max">
                            {guard.status.replace('-', ' ')}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedGuard(guard)}
                            title="Inspect Details"
                            className="p-1.5 rounded-lg bg-[#162342] text-slate-300 hover:text-white border border-[#1c2d54] hover:bg-[#1c2d54]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => dispatchBackup(guard.id)}
                            title="Send Radio Alert to Guard"
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 text-[11px] font-semibold transition-colors flex items-center gap-1"
                          >
                            <Radio className="w-3 h-3" />
                            <span>Radio</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. RECENT INCIDENTS & LOGS STREAM */}
        {incidents.length > 0 && (
          <div className="bg-[#0d1527] border border-[#1c2d54] rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Recent Field Incidents Reported by Guards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {incidents.slice(0, 4).map(inc => (
                <div
                  key={inc.id}
                  className="p-3.5 rounded-xl bg-[#111b33]/60 border border-[#1c2d54] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white capitalize">{inc.type.replace('-', ' ')}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      inc.severity === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      inc.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {inc.severity} Severity
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs">{inc.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-[#1c2d54]">
                    <span>By {inc.guardName} @ {inc.zone}</span>
                    <span className="font-mono">{new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: GUARD INSPECT DRAWER / POPUP */}
      {selectedGuard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0d1527] border border-[#1c2d54] rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1c2d54]">
              <div className="flex items-center gap-3">
                <img
                  src={selectedGuard.avatar}
                  alt={selectedGuard.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#2d4b8a]"
                />
                <div>
                  <h3 className="text-base font-bold text-white">{selectedGuard.name}</h3>
                  <div className="text-xs text-slate-400 font-mono">
                    Badge: {selectedGuard.badgeNumber} • {selectedGuard.phone}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedGuard(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div className="p-3 rounded-xl bg-[#111b33] border border-[#1c2d54] grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">Current Checkpoint:</span>
                  <span className="font-bold text-white">{selectedGuard.currentZone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Assigned Sector:</span>
                  <span className="font-bold text-blue-400">{selectedGuard.assignedSector}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Radio Frequency:</span>
                  <span className="font-mono text-white">{selectedGuard.radioChannel}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Battery Level:</span>
                  <span className="font-bold text-emerald-400">{selectedGuard.batteryLevel}% Charged</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#111b33] border border-[#1c2d54]">
                <span className="text-slate-500 block mb-1">Check-in Health:</span>
                <div className="flex items-center justify-between text-xs">
                  <span>Last check-in: <strong className="text-white">{new Date(selectedGuard.lastCheckInTime).toLocaleTimeString()}</strong></span>
                  <span>Due by: <strong className="text-white">{new Date(selectedGuard.nextCheckInDue).toLocaleTimeString()}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  dispatchBackup(selectedGuard.id);
                  setSelectedGuard(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white"
              >
                Dispatch Radio Order
              </button>
              <button
                type="button"
                onClick={() => setSelectedGuard(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#162342] text-slate-300 hover:text-white border border-[#1c2d54]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESOLVE SOS ALERT WITH DEBRIEF NOTE */}
      {resolveNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0d1527] border border-emerald-500/80 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Resolve SOS Emergency Alert
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Resolving alert for <strong className="text-white">{resolveNoteModal.guardName}</strong> at {resolveNoteModal.zone}.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Resolution Log / Debrief Notes
              </label>
              <textarea
                rows={3}
                value={resolutionNote}
                onChange={e => setResolutionNote(e.target.value)}
                placeholder="e.g. Unit dispatched, area secured, false alarm confirmed by phone..."
                className="w-full bg-[#111b33] border border-[#1c2d54] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setResolveNoteModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-[#162342]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Alert Resolved</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
