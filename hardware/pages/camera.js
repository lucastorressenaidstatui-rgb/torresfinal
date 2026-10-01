import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Text, View, Image, Platform, StyleSheet, Pressable, FlatList, ActivityIndicator, Modal } from 'react-native';
import Container from '../components/container';
import Botao from '../components/buttom';
import { colors } from '../components/theme';

export default function Camera() {
  const ref = useRef(null);
  const lock = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [foto, setFoto] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    async function carregar() {
      try {
        if (Platform.OS === 'web') {
          const stored = JSON.parse(localStorage.getItem('hardware-camera-fotos') || '[]');
          if (active && Array.isArray(stored)) setFotos(stored.filter(item => typeof item?.uri === 'string'));
        } else {
          const MediaLibrary = require('expo-media-library/legacy');
          const access = await MediaLibrary.getPermissionsAsync(false, ['photo']);
          if (!access.granted) return;
          const album = await MediaLibrary.getAlbumAsync('Hardware');
          if (!album) return;
          let after;
          const images = [];
          do {
            const page = await MediaLibrary.getAssetsAsync({ album, mediaType: ['photo'], first: 100, after, sortBy: [['creationTime', false]] });
            images.push(...page.assets);
            after = page.hasNextPage ? page.endCursor : undefined;
          } while (after && active);
          if (active) setFotos(images);
        }
      } catch { if (active) setMessage('Não foi possível carregar as fotos salvas.'); }
    }
    carregar();
    return () => { active = false; };
  }, []);
  async function permitir() {
    if (Platform.OS === 'web' && !globalThis.isSecureContext) { setMessage('A câmera exige HTTPS no navegador. Use o app no celular ou localhost neste computador.'); return; }
    try { const result = await requestPermission(); if (!result.granted) setMessage('Permita a câmera nas configurações do dispositivo ou navegador.'); }
    catch (error) { setMessage('Não foi possível acessar a câmera: ' + error.message); }
  }
  async function capturar() {
    if (!ready || !ref.current || lock.current) return;
    lock.current = true; setBusy(true); setMessage('');
    try {
      const image = await ref.current.takePictureAsync({ quality: 0.8 });
      const photo = { id: String(Date.now()), uri: image.uri };
      const next = [photo, ...fotos];
      setFotos(next);
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem('hardware-camera-fotos', JSON.stringify(next));
        } else {
          const MediaLibrary = require('expo-media-library/legacy');
          const access = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
          if (!access.granted) throw new Error('Permita o acesso às fotos para salvar na galeria.');
          const album = await MediaLibrary.getAlbumAsync('Hardware');
          const asset = await MediaLibrary.createAssetAsync(image.uri, album || undefined);
          if (!album) await MediaLibrary.createAlbumAsync('Hardware', asset, false);
        }
        setMessage('Foto salva na galeria.');
      } catch (error) {
        setMessage('Foto capturada, mas não foi salva permanentemente. ' + error.message);
      }
    }
    catch (error) { setMessage('Não foi possível tirar a foto: ' + error.message); }
    finally { lock.current = false; setBusy(false); }
  }
  async function salvar() {
    if (!foto || lock.current) return;
    lock.current = true; setBusy(true); setMessage('');
    try {
      if (Platform.OS === 'web') {
        const link = document.createElement('a'); link.href = foto; link.download = 'hardware-foto.jpg';
        document.body.appendChild(link); link.click(); link.remove(); setMessage('Download solicitado ao navegador.');
      } else {
        const MediaLibrary = require('expo-media-library/legacy');
        const result = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
        if (!result.granted) { setMessage('Permita o acesso às fotos para salvar na galeria.'); return; }
        await MediaLibrary.saveToLibraryAsync(foto); setMessage('Foto salva na galeria.');
      }
    } catch (error) { setMessage('Não foi possível salvar: ' + error.message); }
    finally { lock.current = false; setBusy(false); }
  }
  if (!permission || !permission.granted) return <Container><Text style={s.text}>{permission ? 'Permita o acesso à câmera para tirar fotos.' : 'Carregando câmera…'}</Text><Botao txt="Permitir câmera" onPress={permitir} /><Text style={s.text}>{message}</Text></Container>;
  return <View style={s.screen}>
    <CameraView ref={ref} style={{ flex: 1, width: '100%' }} onCameraReady={() => setReady(true)} onMountError={({ message: error }) => { setReady(false); setMessage(error); }} />
    <View style={s.controls}>
      <Pressable accessibilityRole="button" accessibilityLabel="Tirar foto" accessibilityState={{ disabled: !ready || busy, busy }} disabled={!ready || busy} onPress={capturar} style={({ pressed }) => [s.shutter, (!ready || busy) && s.disabled, pressed && { opacity: 0.7 }]}>
        {busy ? <ActivityIndicator color={colors.mako} /> : <View style={s.shutterCenter} />}
      </Pressable>
      <Text style={s.label}>{busy ? 'Salvando…' : 'Tirar foto'}</Text>
    </View>
    {!!message && <Text accessibilityLiveRegion="polite" style={s.text}>{message}</Text>}
    <View style={s.gallery}>
      <Text style={s.title}>Galeria · {fotos.length}</Text>
      <FlatList horizontal data={fotos} keyExtractor={item => item.id} showsHorizontalScrollIndicator={false} contentContainerStyle={s.photos} ListEmptyComponent={<Text style={s.empty}>Suas fotos vão aparecer aqui.</Text>} renderItem={({ item, index }) => <Pressable accessibilityRole="button" accessibilityLabel={'Abrir foto ' + (index + 1)} onPress={() => setFoto(item.uri)}><Image source={{ uri: item.uri }} style={s.thumbnail} /></Pressable>} />
    </View>
    <Modal visible={!!foto} animationType="slide" onRequestClose={() => setFoto(null)}>
      <View style={s.screen}>
        {foto && <Image source={{ uri: foto }} style={{ flex: 1, width: '100%' }} resizeMode="contain" />}
        <Text style={s.text}>{message}</Text>
        <Botao txt={busy ? 'Salvando…' : Platform.OS === 'web' ? 'Baixar foto' : 'Salvar cópia no celular'} disabled={busy} onPress={salvar} />
        <Botao txt="Voltar à câmera" disabled={busy} onPress={() => setFoto(null)} />
      </View>
    </Modal>
  </View>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, alignItems: 'center', paddingBottom: 16 },
  text: { color: colors.text, textAlign: 'center', padding: 12 },
  controls: { alignItems: 'center', paddingTop: 16, gap: 6 },
  shutter: { width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: colors.mako, alignItems: 'center', justifyContent: 'center' },
  shutterCenter: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.text },
  disabled: { opacity: 0.4 },
  label: { color: colors.muted, fontSize: 12 },
  gallery: { width: '100%', paddingTop: 12 },
  title: { color: colors.text, fontSize: 16, fontWeight: '600', paddingHorizontal: 16, marginBottom: 10 },
  photos: { paddingHorizontal: 16, gap: 10 },
  thumbnail: { width: 72, height: 88, borderRadius: 12, backgroundColor: colors.panel },
  empty: { color: colors.muted, paddingVertical: 16 },
});
