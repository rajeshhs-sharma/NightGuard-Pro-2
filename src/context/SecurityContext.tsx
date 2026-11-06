import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Guard, CheckInRecord, SosAlert, IncidentReport, UserSession, GuardStatus } from '../types';
import { INITIAL_GUARDS, INITIAL_CHECKINS, INITIAL_SOS_ALERTS, CHECKPOINTS } from '../mockData';
import { soundFX } from '../soundFX';

interface SecurityContextType {
  guards: Guard[];
  checkIns: CheckInRecord[];
  sosAlerts: SosAlert[];
  activeSosAlerts: SosAlert[];
  incidents: IncidentReport[];
  session: UserSession | null;
  activeGuard: Guard | null;
  audioEnabled: boolean;
  toggleAudio: () => void;
  broadcast: string | null;
  setBroadcast: (msg: string | null) => void;
  login: (session: UserSession) => void;
  logout: () => void;
  checkIn: (zoneName: string, note?: string) => void;
  triggerSOS: (nature: SosAlert['nature'], description?: string) => void;
  cancelSOS: () => void;
  resolveSOS: (alertId: string, note?: string) => void;
  acknowledgeSOS: (alertId: string) => void;
  updateStatus: (newStatus: GuardStatus) => void;
  addIncident: (type: IncidentReport['type'], severity: IncidentReport['severity'], description: string, zone: string) => void;
  resetAllData: () => void;
  dispatchBackup: (guardId: string) => void;
}

const STORAGE_KEY_GUARDS = 'nightguard_guards_v1';
const STORAGE_KEY_CHECKINS = 'nightguard_checkins_v1';
const STORAGE_KEY_SOS = 'nightguard_sos_v1';
const STORAGE_KEY_INCIDENTS = 'nightguard_incidents_v1';
const STORAGE_KEY_SESSION = 'nightguard_session_v1';
const STORAGE_KEY_AUDIO = 'nightguard_audio_v1';
const STORAGE_KEY_BROADCAST = 'nightguard_broadcast_v1';

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize Guards
  const [guards, setGuards] = useState<Guard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GUARDS);
      return saved ? JSON.parse(saved) : INITIAL_GUARDS;
    } catch {
      return INITIAL_GUARDS;
    }
  });

  // Initialize CheckIns
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHECKINS);
      return saved ? JSON.parse(saved) : INITIAL_CHECKINS;
    } catch {
      return INITIAL_CHECKINS;
    }
  });

  // Initialize SOS Alerts
  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOS);
      return saved ? JSON.parse(saved) : INITIAL_SOS_ALERTS;
    } catch {
      return INITIAL_SOS_ALERTS;
    }
  });

  // Initialize Incidents
  const [incidents, setIncidents] = useState<IncidentReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INCIDENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Initialize User Session
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSION);
      if (saved) return JSON.parse(saved);
      // Default to supervisor for first glance or null for login
      return null;
    } catch {
      return null;
    }
  });

  // Audio effects enabled
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_AUDIO) !== 'false';
    } catch {
      return true;
    }
  });

  const [broadcast, setBroadcastState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_BROADCAST) || null;
    } catch {
      return null;
    }
  });

  // Persist guards
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GUARDS, JSON.stringify(guards));
    } catch (e) {
      console.error(e);
    }
  }, [guards]);

  // Persist checkIns
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(checkIns));
    } catch (e) {
      console.error(e);
    }
  }, [checkIns]);

  // Persist SOS alerts
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOS, JSON.stringify(sosAlerts));
    } catch (e) {
      console.error(e);
    }
  }, [sosAlerts]);

  // Persist incidents
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(incidents));
    } catch (e) {
      console.error(e);
    }
  }, [incidents]);

  // Persist session
  useEffect(() => {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEY_SESSION);
      }
    } catch (e) {
      console.error(e);
    }
  }, [session]);

  const toggleAudio = () => {
    setAudioEnabled(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_AUDIO, String(next));
      return next;
    });
  };

  const setBroadcast = (msg: string | null) => {
    setBroadcastState(msg);
    if (msg) {
      localStorage.setItem(STORAGE_KEY_BROADCAST, msg);
    } else {
      localStorage.removeItem(STORAGE_KEY_BROADCAST);
    }
  };

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_GUARDS && e.newValue) {
        setGuards(JSON.parse(e.newValue));
      } else if (e.key === STORAGE_KEY_SOS && e.newValue) {
        setSosAlerts(JSON.parse(e.newValue));
      } else if (e.key === STORAGE_KEY_CHECKINS && e.newValue) {
        setCheckIns(JSON.parse(e.newValue));
      } else if (e.key === STORAGE_KEY_BROADCAST) {
        setBroadcastState(e.newValue || null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Active SOS alerts (not resolved)
  const activeSosAlerts = sosAlerts.filter(a => a.status !== 'resolved');

  // Trigger siren effect when new active SOS arises
  useEffect(() => {
    if (activeSosAlerts.length > 0 && audioEnabled) {
      soundFX.playSosAlert();
    }
  }, [activeSosAlerts.length, audioEnabled]);

  // Active guard derived from current session
  const activeGuard = session?.role === 'guard' && session.guardId
    ? guards.find(g => g.id === session.guardId) || null
    : null;

  const login = (newSession: UserSession) => {
    setSession(newSession);
  };

  const logout = () => {
    setSession(null);
  };

  // Guard Check-in action
  const checkIn = useCallback((zoneName: string, note?: string) => {
    if (!activeGuard) return;

    const matchedCheckpoint = CHECKPOINTS.find(cp => cp.name === zoneName);
    const newCoords = matchedCheckpoint ? matchedCheckpoint.coordinates : activeGuard.coordinates;

    const now = new Date();
    const nextDue = new Date(now.getTime() + 30 * 60 * 1000); // Next check-in in 30 minutes

    const newRecord: CheckInRecord = {
      id: `ci-${Date.now()}`,
      guardId: activeGuard.id,
      guardName: activeGuard.name,
      zone: zoneName,
      timestamp: now.toISOString(),
      status: activeGuard.status === 'sos' ? 'sos-cleared' : 'normal',
      note: note || `Scheduled checkpoint verification at ${zoneName}`,
    };

    setCheckIns(prev => [newRecord, ...prev.slice(0, 49)]);

    setGuards(prev =>
      prev.map(g => {
        if (g.id === activeGuard.id) {
          return {
            ...g,
            currentZone: zoneName,
            status: g.status === 'sos' ? 'on-duty' : g.status,
            lastCheckInTime: now.toISOString(),
            nextCheckInDue: nextDue.toISOString(),
            coordinates: newCoords,
            activeSosId: undefined,
          };
        }
        return g;
      })
    );

    // If guard had an active SOS, resolve it upon successful check-in
    if (activeGuard.activeSosId) {
      setSosAlerts(prev =>
        prev.map(a =>
          a.id === activeGuard.activeSosId
            ? { ...a, status: 'resolved', resolvedAt: now.toISOString(), resolvedBy: 'Guard Check-in' }
            : a
        )
      );
    }

    if (audioEnabled) {
      soundFX.playCheckInPing();
    }
  }, [activeGuard, audioEnabled]);

  // Guard Big SOS Trigger
  const triggerSOS = useCallback((nature: SosAlert['nature'] = 'panic', description: string = 'EMERGENCY: Immediate guard assistance requested!') => {
    if (!activeGuard) return;

    const alertId = `sos-${Date.now()}`;
    const now = new Date().toISOString();

    const newAlert: SosAlert = {
      id: alertId,
      guardId: activeGuard.id,
      guardName: activeGuard.name,
      badgeNumber: activeGuard.badgeNumber,
      zone: activeGuard.currentZone,
      timestamp: now,
      nature,
      description,
      status: 'active',
    };

    setSosAlerts(prev => [newAlert, ...prev]);

    setGuards(prev =>
      prev.map(g => {
        if (g.id === activeGuard.id) {
          return {
            ...g,
            status: 'sos',
            activeSosId: alertId,
          };
        }
        return g;
      })
    );

    if (audioEnabled) {
      soundFX.playSosAlert();
    }
  }, [activeGuard, audioEnabled]);

  // Guard Cancel SOS (e.g. accidental press)
  const cancelSOS = useCallback(() => {
    if (!activeGuard) return;

    const now = new Date().toISOString();

    setSosAlerts(prev =>
      prev.map(a => {
        if (a.guardId === activeGuard.id && a.status !== 'resolved') {
          return {
            ...a,
            status: 'resolved',
            resolvedAt: now,
            resolvedBy: `${activeGuard.name} (False Alarm)`,
          };
        }
        return a;
      })
    );

    setGuards(prev =>
      prev.map(g => {
        if (g.id === activeGuard.id) {
          return {
            ...g,
            status: 'on-duty',
            activeSosId: undefined,
          };
        }
        return g;
      })
    );
  }, [activeGuard]);

  // Supervisor Acknowledge SOS
  const acknowledgeSOS = useCallback((alertId: string) => {
    setSosAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'acknowledged' } : a))
    );
  }, []);

  // Supervisor Resolve SOS
  const resolveSOS = useCallback((alertId: string, note?: string) => {
    const now = new Date().toISOString();
    let affectedGuardId: string | undefined;

    setSosAlerts(prev =>
      prev.map(a => {
        if (a.id === alertId) {
          affectedGuardId = a.guardId;
          return {
            ...a,
            status: 'resolved',
            resolvedAt: now,
            resolvedBy: `Supervisor${note ? ` - ${note}` : ''}`,
          };
        }
        return a;
      })
    );

    if (affectedGuardId) {
      setGuards(prev =>
        prev.map(g => {
          if (g.id === affectedGuardId) {
            return {
              ...g,
              status: 'on-duty',
              activeSosId: undefined,
            };
          }
          return g;
        })
      );
    }
  }, []);

  // Update Guard Status (Patrolling, On Duty, Break)
  const updateStatus = useCallback((newStatus: GuardStatus) => {
    if (!activeGuard) return;
    setGuards(prev =>
      prev.map(g => (g.id === activeGuard.id ? { ...g, status: newStatus } : g))
    );
  }, [activeGuard]);

  // Add Incident Report
  const addIncident = useCallback((
    type: IncidentReport['type'],
    severity: IncidentReport['severity'],
    description: string,
    zone: string
  ) => {
    if (!session) return;
    const guardName = session.role === 'guard' && activeGuard ? activeGuard.name : 'Command Staff';
    const guardId = session.role === 'guard' && activeGuard ? activeGuard.id : 'sup-hq';

    const newIncident: IncidentReport = {
      id: `inc-${Date.now()}`,
      guardId,
      guardName,
      timestamp: new Date().toISOString(),
      zone,
      type,
      severity,
      description,
    };

    setIncidents(prev => [newIncident, ...prev]);
  }, [session, activeGuard]);

  // Dispatch backup to guard
  const dispatchBackup = useCallback((guardId: string) => {
    const target = guards.find(g => g.id === guardId);
    if (!target) return;
    setBroadcast(`ALERT: Reinforcements dispatched to ${target.name} at [${target.currentZone}]. Immediate response required.`);
  }, [guards]);

  // Reset to initial demo data
  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY_GUARDS);
    localStorage.removeItem(STORAGE_KEY_CHECKINS);
    localStorage.removeItem(STORAGE_KEY_SOS);
    localStorage.removeItem(STORAGE_KEY_INCIDENTS);
    localStorage.removeItem(STORAGE_KEY_BROADCAST);
    setGuards(INITIAL_GUARDS);
    setCheckIns(INITIAL_CHECKINS);
    setSosAlerts(INITIAL_SOS_ALERTS);
    setIncidents([]);
    setBroadcastState(null);
  };

  return (
    <SecurityContext.Provider
      value={{
        guards,
        checkIns,
        sosAlerts,
        activeSosAlerts,
        incidents,
        session,
        activeGuard,
        audioEnabled,
        toggleAudio,
        broadcast,
        setBroadcast,
        login,
        logout,
        checkIn,
        triggerSOS,
        cancelSOS,
        resolveSOS,
        acknowledgeSOS,
        updateStatus,
        addIncident,
        resetAllData,
        dispatchBackup,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
