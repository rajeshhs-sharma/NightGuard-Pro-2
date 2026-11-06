import React from 'react';
import { Guard, CheckpointZone, SosAlert } from '../types';
import { ShieldAlert, MapPin, Radio } from 'lucide-react';

interface TacticalMapProps {
  guards: Guard[];
  checkpoints: CheckpointZone[];
  activeSosAlerts: SosAlert[];
  onSelectGuard?: (guard: Guard) => void;
  selectedGuardId?: string;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  guards,
  checkpoints,
  activeSosAlerts,
  onSelectGuard,
  selectedGuardId,
}) => {
  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-[#090f1d] border border-[#1c2d54] rounded-2xl overflow-hidden shadow-2xl">
      {/* Tactical Grid Background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #2d4b8a 1px, transparent 1px),
            linear-gradient(to bottom, #2d4b8a 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Sector demarcations */}
      <div className="absolute inset-0 p-4 pointer-events-none grid grid-cols-2 grid-rows-2 border border-blue-500/10">
        <div className="border-r border-b border-blue-500/20 p-2 text-[10px] font-mono text-blue-400/40 uppercase tracking-widest">
          Sector Alpha • Main Facilities
        </div>
        <div className="border-b border-blue-500/20 p-2 text-right text-[10px] font-mono text-blue-400/40 uppercase tracking-widest">
          Sector Bravo • Logistics & Warehouse
        </div>
        <div className="border-r border-blue-500/20 p-2 flex items-end text-[10px] font-mono text-blue-400/40 uppercase tracking-widest">
          Sector Delta • Secure Vault
        </div>
        <div className="p-2 flex items-end justify-end text-[10px] font-mono text-blue-400/40 uppercase tracking-widest">
          Sector Charlie • Perimeter & Yard
        </div>
      </div>

      {/* Perimeter lines SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <line x1="15%" y1="15%" x2="85%" y2="15%" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="85%" y1="15%" x2="85%" y2="85%" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="85%" y1="85%" x2="15%" y2="85%" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="15%" y1="85%" x2="15%" y2="15%" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" />
      </svg>

      {/* Fixed Checkpoint Markers */}
      {checkpoints.map(cp => (
        <div
          key={cp.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
          style={{ left: `${cp.coordinates.x}%`, top: `${cp.coordinates.y}%` }}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-[#162342] border-2 border-blue-400/60 flex items-center justify-center cursor-pointer group-hover:scale-125 transition-transform shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          </div>

          {/* Hover Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[#0d1527] border border-[#1c2d54] text-white text-[11px] px-2.5 py-1 rounded shadow-xl whitespace-nowrap z-30 pointer-events-none">
            <div className="font-bold text-blue-300">{cp.name}</div>
            <div className="text-[10px] text-slate-400">{cp.code} • {cp.sector}</div>
          </div>
        </div>
      ))}

      {/* Guard Location Pins & SOS Beacon Rings */}
      {guards.map(guard => {
        const isSos = guard.status === 'sos';
        const isSelected = selectedGuardId === guard.id;

        return (
          <div
            key={guard.id}
            onClick={() => onSelectGuard?.(guard)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group transition-all duration-500`}
            style={{ left: `${guard.coordinates.x}%`, top: `${guard.coordinates.y}%` }}
          >
            {/* Pulsing ring for SOS alerts */}
            {isSos ? (
              <div className="relative flex items-center justify-center">
                <span className="absolute w-12 h-12 bg-red-600/40 rounded-full animate-ping" />
                <div className="relative w-9 h-9 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                  <ShieldAlert className="w-5 h-5 animate-bounce" />
                </div>
              </div>
            ) : (
              <div
                className={`relative flex items-center justify-center transition-transform hover:scale-110 ${
                  isSelected ? 'scale-125' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full overflow-hidden border-2 shadow-lg ${
                    isSelected
                      ? 'border-cyan-400 ring-2 ring-cyan-400/50'
                      : 'border-blue-400/80 bg-[#162342]'
                  }`}
                >
                  <img src={guard.avatar} alt={guard.name} className="w-full h-full object-cover" />
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#0d1527] ${
                    guard.status === 'patrolling' ? 'bg-cyan-400' : 'bg-emerald-400'
                  }`}
                />
              </div>
            )}

            {/* Permanent/Hover Guard Label */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-md pointer-events-none transition-all ${
                isSos
                  ? 'bg-red-600 text-white font-bold animate-pulse'
                  : 'bg-[#0d1527]/90 border border-[#1c2d54] text-slate-300'
              }`}
            >
              {guard.name.split(' ')[0]} ({guard.badgeNumber.replace('NG-', '')})
            </div>
          </div>
        );
      })}

      {/* Live Map Legend */}
      <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-[#0d1527]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#1c2d54] text-[10px] text-slate-400 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Active Guard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Patrol</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-red-400 font-bold">SOS Beacon</span>
        </div>
      </div>
    </div>
  );
};
