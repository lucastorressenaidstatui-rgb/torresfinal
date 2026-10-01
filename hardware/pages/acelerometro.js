import { colors } from '../components/theme';
import React, { useEffect, useRef, useState } from 'react';
import Botao from '../components/buttom';
import { StyleSheet, View, Text } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default function Acelerometro({navigation}) {

  const [dados, setDados] = useState({
    x: 0,
    y: 0,
    z: 0
  });

  const subscription = useRef(null);
  const lock = useRef(false);
  const mounted = useRef(true);
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState('Ative o sensor para medir o nível.');
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; subscription.current?.remove(); }; }, []);
  async function ativar() {
    if (lock.current || subscription.current) return;
    lock.current = true;
    try {
      const permission = await Accelerometer.requestPermissionsAsync();
      if (!mounted.current) return;
      if (!permission.granted) { setMessage('Permita o acesso ao movimento do dispositivo.'); return; }
      const available = await Accelerometer.isAvailableAsync();
      if (!mounted.current) return;
      if (!available) { setMessage('Acelerômetro indisponível. Use um celular compatível e HTTPS no navegador.'); return; }
      Accelerometer.setUpdateInterval(100);
      subscription.current = Accelerometer.addListener(setDados);
      setActive(true); setMessage('');
    } catch (error) { if (mounted.current) setMessage('Não foi possível ativar o sensor: ' + error.message); }
    finally { lock.current = false; }
  }

  const left = Math.max(0, Math.min(274, 137 + dados.x * 80));
  const top = Math.max(0, Math.min(274, 137 - dados.y * 80));

  const nivelado =
    Math.abs(dados.x) < 0.05 &&
    Math.abs(dados.y) < 0.05;

  return (

    <View style={styles.container}>

      <Text style={styles.titulo}>
        Nível Digital
      </Text>

      <View style={styles.quadro}>

        <View
          style={[
            styles.bola,
            {
              left,
              top,
              backgroundColor: nivelado ? colors.mako : "#FF7C8A"
            }
          ]}
        />

      </View>

      <Text style={styles.status}>
        {active ? (nivelado ? "✅ Nivelado" : "⚠️ Fora do nível") : message}
      </Text>

      <Botao txt={active ? 'Sensor ativo' : 'Ativar sensor'} disabled={active} onPress={ativar} />
      <Text style={{ color: colors.text }}>X: {dados.x.toFixed(2)}</Text>
      <Text style={{ color: colors.text }}>Y: {dados.y.toFixed(2)}</Text>
      <Text style={{ color: colors.text }}>Z: {dados.z.toFixed(2)}</Text>

    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', backgroundColor: colors.background
  },

  titulo: {
    fontSize: 28, color: colors.text,
    fontWeight: 'bold',
    marginBottom: 20
  },

  quadro: {
    width: 300,
    height: 300,
    borderWidth: 3,
    borderColor: colors.border,
    position: 'relative',
    backgroundColor: colors.panel
  },

  bola: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute'
  },

  status: {
    fontSize: 22, color: colors.mako,
    marginTop: 30,
    marginBottom: 20
  }

});
