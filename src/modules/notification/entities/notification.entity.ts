export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
}

export class Notification {
  email?: string;
  phone?: string;
  message: string;
  type: NotificationType;
}
