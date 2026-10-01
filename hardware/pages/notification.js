import { useRef, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import Container from '../components/container';
import Botao from '../components/buttom';
import { colors } from '../components/theme';
import { notificationSounds, useNotificationSound } from '../services/notificationSound';

export default function Notificacao() {
  const { soundId } = useNotificationSound();
  const player = useAudioPlayer(notificationSounds.find(sound => sound.id === soundId).source);
  const [message, setMessage] = useState('');
  const queue = useRef(Promise.resolve());
  function tocar() {
    queue.current = queue.current.then(async () => {
      try {
        setMessage('');
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
        await player.seekTo(0);
        player.play();
      } catch { setMessage('Não foi possível tocar o som. Tente novamente.'); }
    });
  }
  return <Container>
    <Text style={s.title}>Notificação</Text>
    <Botao txt="Tocar notificação" onPress={tocar} style={s.button} />
    {!!message && <Text accessibilityLiveRegion="polite" style={s.message}>{message}</Text>}
  </Container>;
}
const s = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: '700', marginBottom: 24 },
  button: { borderRadius: 14 },
  message: { color: colors.muted, textAlign: 'center', marginTop: 16 },
});
