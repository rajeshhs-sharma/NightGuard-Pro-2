export type GuardStatus = 'on-duty' | 'patrolling' | 'break' | 'sos' | 'off-duty';

export interface Guard {
  id: string;
  name: string;
  badgeNumber: string;
  avatar: string;
  phone: string;
  radioChannel: string;
  currentZone: string;
  assignedSector: string;
  status: GuardStatus;
  lastCheckInTime: string; // ISO string
  nextCheckInDue: string; // ISO string
  batteryLevel: number;
  coordinates: { x: number; y: number }; // Percentage on tactical map
  activeSosId?: string;
}

export interface CheckInRecord {
  id: string;
  guardId: string;
  guardName: string;
  zone: string;
  timestamp: string;
  status: 'normal' | 'late' | 'sos-cleared';
  note?: string;
}

export interface SosAlert {
  id: string;
  guardId: string;
  guardName: string;
  badgeNumber: string;
  zone: string;
  timestamp: string;
  nature: 'breach' | 'medical' | 'fire' | 'altercation' | 'panic';
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface IncidentReport {
  id: string;
  guardId: string;
  guardName: string;
  timestamp: string;
  zone: string;
  type: 'suspicious-activity' | 'door-unlocked' | 'vandalism' | 'equipment-fault' | 'trespassing';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface UserSession {
  role: 'guard' | 'supervisor';
  guardId?: string;
  supervisorName?: string;
}

export interface CheckpointZone {
  id: string;
  name: string;
  code: string;
  sector: string;
  coordinates: { x: number; y: number };
  description: string;
}
