import React from 'react';
import { SecurityProvider, useSecurity } from './context/SecurityContext';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { GuardView } from './components/GuardView';
import { SupervisorView } from './components/SupervisorView';
import { Shield, ShieldAlert, ArrowLeftRight } from 'lucide-react';

const MainContent: React.FC = () => {
  const { session, login, guards } = useSecurity();

  if (!session) {
    return <LoginView />;
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1">
        {session.role === 'guard' ? <GuardView /> : <SupervisorView />}
      </div>

      {/* Floating Tactical Quick Switcher (allows effortless testing between Guard & Supervisor views) */}
      <aside aria-label="Demo Role Switcher" className="fixed bottom-3 right-3 z-30">
        <div className="bg-[#0d1527]/90 backdrop-blur-md border border-[#1c2d54] p-1.5 rounded-2xl shadow-2xl flex items-center gap-1.5 text-xs">
          <span className="text-[10px] font-mono text-slate-400 pl-2 pr-1 hidden sm:inline uppercase tracking-wider">
            Quick Switch:
          </span>

          <button
            onClick={() =>
              login({
                role: 'guard',
                guardId: session.guardId || guards[0]?.id || 'guard-101',
              })
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
              session.role === 'guard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#162342]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Guard App</span>
          </button>

          <button
            onClick={() =>
              login({
                role: 'supervisor',
                supervisorName: 'Commander Robert Vance',
              })
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
              session.role === 'supervisor'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#162342]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Supervisor HQ</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default function App() {
  return (
    <SecurityProvider>
      <MainContent />
    </SecurityProvider>
  );
}
