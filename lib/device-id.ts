// lib/device-id.ts
import { v4 as uuidv4 } from 'uuid';

export const getDeviceId = (): string => {
  if (typeof window === 'undefined') {
    return uuidv4();
  }

  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('device_id', deviceId);
  }

  return deviceId;
};