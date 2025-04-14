import type { AuditLog } from '@/types/audit';

export const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: '1',
    action: 'UPDATE_SETTINGS',
    details: 'Updated quiz time limit from 30 to 45 minutes',
    timestamp: '2024-04-15T10:30:00.000Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0'
  },
  {
    id: '2',
    userId: '1',
    action: 'CREATE_QUIZ',
    details: 'Created new quiz: Basic Math Quiz',
    timestamp: '2024-04-15T11:15:00.000Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0'
  },
  {
    id: '3',
    userId: '2',
    action: 'DELETE_QUESTION',
    details: 'Removed question from Advanced Math Quiz',
    timestamp: '2024-04-15T14:20:00.000Z',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0'
  }
];
