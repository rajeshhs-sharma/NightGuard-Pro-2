import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';
import { CHECKPOINTS } from '../mockData';
import { IncidentReport } from '../types';

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: IncidentReport['type'], severity: IncidentReport['severity'], description: string, zone: string) => void;
  defaultZone: string;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({ isOpen, onClose, onSubmit, defaultZone }) => {
  const [type, setType] = useState<IncidentReport['type']>('suspicious-activity');
  const [severity, setSeverity] = useState<IncidentReport['severity']>('medium');
  const [zone, setZone] = useState<string>(defaultZone || CHECKPOINTS[0].name);
  const [description, setDescription] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmit(type, severity, description.trim(), zone);
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0d1527] border border-[#1c2d54] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c2d54] bg-[#111b33]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Log Security Incident</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#162342] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Checkpoint / Location</label>
            <select
              value={zone}
              onChange={e => setZone(e.target.value)}
              className="w-full bg-[#111b33] border border-[#1c2d54] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {CHECKPOINTS.map(cp => (
                <option key={cp.id} value={cp.name}>
                  {cp.name} ({cp.sector})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Incident Category</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as IncidentReport['type'])}
                className="w-full bg-[#111b33] border border-[#1c2d54] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="suspicious-activity">Suspicious Activity</option>
                <option value="door-unlocked">Door / Gate Left Unlocked</option>
                <option value="trespassing">Unauthorized Trespass</option>
                <option value="vandalism">Property Damage / Vandalism</option>
                <option value="equipment-fault">Camera / Alarm Fault</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Severity Level</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as IncidentReport['severity'])}
                className="w-full bg-[#111b33] border border-[#1c2d54] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Low (Advisory)</option>
                <option value="medium">Medium (Requires Action)</option>
                <option value="high">High (Urgent Priority)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Incident Details / Observations</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide exact observations, vehicle descriptions, badge numbers, or damage assessment..."
              className="w-full bg-[#111b33] border border-[#1c2d54] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500 resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#162342] border border-[#1c2d54] hover:bg-[#1c2d54]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Check className="w-4 h-4" />
              <span>Submit Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
