import { Pressable, Text, StyleSheet } from 'react-native';
import { colors } from './theme';
export default function Botao({ txt, onPress, disabled = false, style }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, style, pressed && styles.pressed, disabled && { opacity: 0.45 }]}><Text style={styles.text}>{txt}</Text></Pressable>;
}
const styles = StyleSheet.create({
  button: { width: '80%', maxWidth: 420, minHeight: 52, padding: 14, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.mako, borderRadius: 6, alignItems: 'center', justifyContent: 'center', margin: 10 },
  pressed: { backgroundColor: '#244775' },
  text: { fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'center' },
});
