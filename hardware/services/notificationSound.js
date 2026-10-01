import { createContext, useContext, useState } from 'react';

export const notificationSounds = [
  { id: 'alerta', name: 'Notificação', icon: '🔔', source: require('../assets/notification.wav') },
  { id: 'futebol', name: 'Futebol', icon: '⚽', source: require('../assets/bolinha.mp3') },
];
const SoundContext = createContext(null);
export function NotificationSoundProvider({ children }) {
  const [soundId, setSoundId] = useState('alerta');
  return <SoundContext.Provider value={{ soundId, setSoundId }}>{children}</SoundContext.Provider>;
}
export function useNotificationSound() { return useContext(SoundContext); }
