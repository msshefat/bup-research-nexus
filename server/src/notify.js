import { Notification } from './models/Notification.js';

export async function notify(userId, { title, body = '', link = '', kind = 'info' }) {
  return Notification.create({ user: userId, title, body, link, kind });
}
