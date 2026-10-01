import { useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import Botao from '../components/buttom';
import { colors } from '../components/theme';
import { notificationSounds, useNotificationSound } from '../services/notificationSound';

const sampleSource = require('../assets/bolinha.mp3');
function tempo(seconds) {
  const value = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(value / 60).toString().padStart(2, '0')}:${(value % 60).toString().padStart(2, '0')}`;
}

export default function Audio() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const voicePlayer = useAudioPlayer(null);
  const voiceStatus = useAudioPlayerStatus(voicePlayer);
  const { soundId, setSoundId } = useNotificationSound();
  const [previewId, setPreviewId] = useState(soundId);
  const footballPlayer = useAudioPlayer(sampleSource);
  const alertPlayer = useAudioPlayer(require('../assets/notification.wav'));
  const samplePlayer = previewId === 'futebol' ? footballPlayer : alertPlayer;
  const sampleStatus = useAudioPlayerStatus(samplePlayer);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [clip, setClip] = useState(null);
  const [message, setMessage] = useState('Toque em gravar e fale. Depois, ouça sua mensagem.');
  const lock = useRef(false);
  const startedAt = useRef(0);

  async function iniciar() {
    if (lock.current || recording) return;
    if (Platform.OS === 'web' && !globalThis.isSecureContext) { setMessage('Para gravar no navegador, use HTTPS ou localhost. No celular, abra pelo Expo Go.'); return; }
    lock.current = true; setBusy(true);
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) { setMessage('Permita o acesso ao microfone nas configurações para gravar sua voz.'); return; }
      voicePlayer.pause(); samplePlayer.pause();
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record(); startedAt.current = Date.now(); setRecording(true); setMessage('Gravando… toque em parar quando terminar.');
    } catch (error) {
      setMessage('Não foi possível iniciar a gravação: ' + error.message);
      await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    } finally { lock.current = false; setBusy(false); }
  }

  async function parar() {
    if (lock.current || !recording) return;
    lock.current = true; setBusy(true);
    try {
      await recorder.stop(); setRecording(false);
      const uri = recorder.uri;
      if (!uri) throw new Error('A gravação não gerou um arquivo. Tente novamente.');
      voicePlayer.replace({ uri });
      setClip({ uri, duration: Math.max(recorderState.durationMillis / 1000, (Date.now() - startedAt.current) / 1000) });
      setMessage('Sua mensagem está pronta. Toque em ouvir.');
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    } catch (error) { setMessage('Não foi possível finalizar a gravação: ' + error.message); }
    finally { lock.current = false; setBusy(false); }
  }

  async function ouvir() {
    if (!clip || recording || busy) return;
    try {
      if (voiceStatus.playing) { voicePlayer.pause(); return; }
      samplePlayer.pause();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      if (voiceStatus.didJustFinish || (Number.isFinite(voiceStatus.duration) && voiceStatus.duration > 0 && voiceStatus.currentTime >= voiceStatus.duration - 0.05)) await voicePlayer.seekTo(0);
      voicePlayer.play(); setMessage('Ouça o áudio que você gravou.');
    } catch (error) { setMessage('Não foi possível ouvir sua gravação: ' + error.message); }
  }

  function apagar() {
    voicePlayer.pause(); voicePlayer.replace(null); setClip(null);
    setMessage('Áudio removido. Você pode gravar uma nova mensagem.');
  }
  async function tocarExemplo() {
    try {
      voicePlayer.pause(); await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      await samplePlayer.seekTo(0); samplePlayer.play();
    } catch (error) { setMessage('Não foi possível reproduzir o áudio: ' + error.message); }
  }
  function escolherSom(id) {
    footballPlayer.pause(); alertPlayer.pause();
    setPreviewId(id); setSoundId(id);
  }
  const duration = Number.isFinite(voiceStatus.duration) && voiceStatus.duration > 0 ? voiceStatus.duration : clip?.duration || 0;
  const progress = duration > 0 ? Math.min(1, voiceStatus.currentTime / duration) : 0;
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Text style={s.eyebrow}>MENSAGEM DE VOZ</Text>
      <Text style={s.title}>Sua voz, seu áudio.</Text>
      <Text style={s.subtitle}>Grave pelo microfone e ouça quantas vezes quiser.</Text>
      <View style={s.recorder}>
        <Text style={[s.timer, recording && s.live]}>{tempo(recording ? recorderState.durationMillis / 1000 : 0)}</Text>
        <Text style={s.label}>{recording ? '● GRAVANDO' : 'MICROFONE'}</Text>
        <Botao txt={busy ? 'Aguarde…' : recording ? 'Parar gravação' : 'Gravar meu áudio'} disabled={busy} onPress={recording ? parar : iniciar} style={s.button} />
      </View>
      <Text accessibilityLiveRegion="polite" style={s.message}>{message}</Text>
      {clip && <View style={s.bubble}>
        <View style={s.voiceRow}>
          <Pressable accessibilityRole="button" accessibilityLabel={voiceStatus.playing ? 'Pausar minha gravação' : 'Ouvir minha gravação'} accessibilityState={{ disabled: recording || busy }} disabled={recording || busy} onPress={ouvir} style={[s.play, (recording || busy) && { opacity: 0.4 }]}><Text style={s.playIcon}>{voiceStatus.playing ? 'Ⅱ' : '▶'}</Text></Pressable>
          <View style={s.voiceDetails}><Text style={s.voiceTitle}>Seu áudio</Text><View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }} style={s.track}><View style={[s.fill, { width: `${progress * 100}%` }]} /></View><Text style={s.time}>{tempo(voiceStatus.currentTime)} / {tempo(duration)}</Text></View>
        </View>
        <Botao txt="Apagar gravação" disabled={recording || busy} onPress={apagar} style={s.button} />
      </View>}
      <Text style={s.note}>A gravação fica disponível nesta tela. Uma nova gravação substitui a anterior.</Text>
      <View style={s.example}>
        <Text style={s.soundTitle}>Som de notificação</Text>
        <View style={s.soundOptions}>{notificationSounds.map(sound => <Pressable key={sound.id} accessibilityRole="radio" accessibilityLabel={sound.name} accessibilityState={{ checked: soundId === sound.id, disabled: recording || busy }} disabled={recording || busy} onPress={() => escolherSom(sound.id)} style={[s.soundCard, soundId === sound.id && s.selectedSound, (recording || busy) && { opacity: 0.4 }]}>
          <Text style={s.soundIcon}>{sound.icon}</Text>
          <Text style={s.voiceTitle}>{sound.name}</Text>
          <Text style={s.soundLabel}>{soundId === sound.id ? 'Selecionado' : 'Selecionar'}</Text>
        </Pressable>)}</View>
        <Text style={s.note}>O som selecionado será usado no botão de notificação.</Text>
        <Text style={s.message}>{sampleStatus.playing ? 'Reproduzindo áudio' : notificationSounds.find(sound => sound.id === previewId).name}</Text>
        <Botao txt="Reproduzir áudio" disabled={recording || busy} onPress={tocarExemplo} style={s.button} />
        <Botao txt="Pausar" disabled={!sampleStatus.playing} onPress={() => samplePlayer.pause()} style={s.button} />
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 40, width: '100%', maxWidth: 600, alignSelf: 'center' },
  eyebrow: { color: colors.mako, fontSize: 11, letterSpacing: 2, fontWeight: '700', marginBottom: 12 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 12, marginBottom: 24 },
  recorder: { backgroundColor: colors.panel, borderRadius: 18, padding: 22, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  timer: { color: colors.text, fontSize: 44, fontWeight: '700', fontVariant: ['tabular-nums'] },
  live: { color: '#FF7C8A' },
  label: { color: colors.muted, fontSize: 11, letterSpacing: 1.5, marginVertical: 12 },
  button: { width: '100%', maxWidth: '100%', marginHorizontal: 0 },
  message: { color: colors.text, fontSize: 14, lineHeight: 22, marginVertical: 16, textAlign: 'center' },
  bubble: { backgroundColor: colors.panel, borderRadius: 20, borderBottomRightRadius: 4, padding: 18, borderWidth: 1, borderColor: colors.mako },
  voiceRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  play: { backgroundColor: colors.mako, width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  playIcon: { color: colors.background, fontSize: 22, fontWeight: '800' },
  voiceDetails: { flex: 1 },
  voiceTitle: { color: colors.text, fontWeight: '700', fontSize: 16 },
  track: { backgroundColor: '#36506A', height: 5, borderRadius: 3, marginVertical: 12, overflow: 'hidden' },
  fill: { backgroundColor: colors.mako, height: '100%' },
  time: { color: colors.muted, fontSize: 12, fontVariant: ['tabular-nums'] },
  note: { color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: 16 },
  example: { marginTop: 30, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 },
  soundTitle: { color: colors.text, fontSize: 20, fontWeight: '600', marginBottom: 16 },
  soundOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  soundCard: { flex: 1, minWidth: 120, backgroundColor: colors.panel, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 18, alignItems: 'center', gap: 8 },
  selectedSound: { borderColor: colors.mako, backgroundColor: '#193C43' },
  soundIcon: { fontSize: 42 },
  soundLabel: { color: colors.muted, fontSize: 12 },
});
