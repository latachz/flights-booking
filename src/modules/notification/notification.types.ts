export interface NotificationResult {
  notificationId: string
  channel: 'EMAIL' | 'SMS'
  status: 'SENT' | 'FAILED'
}
