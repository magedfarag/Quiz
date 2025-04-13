export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details?: string;
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
}
