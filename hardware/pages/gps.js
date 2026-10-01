import { useRef, useState } from 'react';
import { Text, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import Botao from '../components/buttom';
import Container from '../components/container';
import { colors } from '../components/theme';

export default function Gps() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('Busque sua localização para abrir o mapa.');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  async function localizar() {
    if (Platform.OS === 'web' && !globalThis.isSecureContext) { setStatus('O GPS exige HTTPS no navegador. Use o app no celular ou localhost neste computador.'); return; }
    if (lock.current) return;
    lock.current = true; setBusy(true); setStatus('Buscando localização…');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) { setStatus('Permissão negada. Autorize a localização nas configurações.'); return; }
      if (!(await Location.hasServicesEnabledAsync())) { setStatus('Ative a localização do dispositivo.'); return; }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords(position.coords); setStatus('Localização encontrada.');
    } catch (error) { setStatus('Não foi possível localizar: ' + error.message); }
    finally { lock.current = false; setBusy(false); }
  }
  async function abrirMapa() {
    if (!coords) return;
    try { await Linking.openURL(`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`); }
    catch (error) { setStatus('Não foi possível abrir o mapa: ' + error.message); }
  }
  return <Container><Text style={{ color: colors.text, fontSize: 30, fontWeight: 'bold', marginBottom: 24 }}>Meu GPS</Text><Text style={{ color: colors.text }}>Latitude: {coords ? coords.latitude.toFixed(6) : '—'}</Text><Text style={{ color: colors.text }}>Longitude: {coords ? coords.longitude.toFixed(6) : '—'}</Text><Text accessibilityLiveRegion="polite" style={{ color: colors.text, margin: 20, textAlign: 'center' }}>{status}</Text><Botao txt={busy ? 'Buscando…' : 'Buscar localização'} disabled={busy} onPress={localizar} /><Botao txt="Abrir no Google Maps" disabled={!coords} onPress={abrirMapa} /></Container>;
}
