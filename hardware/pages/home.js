import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { colors } from '../components/theme';
const modules = [
  ['01', 'Áudio', 'Gravação e reprodução', 'Audio'],
  ['02', 'Câmera', 'Fotos e galeria', 'Camera'],
  ['03', 'Acelerômetro', 'Movimento do dispositivo', 'Acelerometro'],
  ['04', 'GPS', 'Localização atual', 'Gps'],
  ['05', 'Notificação', 'Alerta sonoro', 'Notificacao'],
];
export default function Home({ navigation }) {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <Text style={styles.brand}>HARDWARE</Text>
    <Text style={styles.title}>Recursos do dispositivo</Text>
    <View style={styles.menu}>
      {modules.map(([number, title, description, route]) => (
        <Pressable key={route} accessibilityRole="button" accessibilityLabel={title} onPress={() => navigation.navigate(route)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <View style={styles.badge}><Text style={styles.number}>{number}</Text></View>
          <View style={styles.rowContent}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.description}>{description}</Text></View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ))}
    </View>
  </ScrollView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 48, paddingBottom: 40, maxWidth: 760, width: '100%', alignSelf: 'center' },
  brand: { color: colors.mako, fontSize: 12, letterSpacing: 3, fontWeight: '700' },
  title: { color: colors.text, fontSize: 32, lineHeight: 40, fontWeight: '700', marginTop: 12, marginBottom: 32 },
  menu: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 20, borderWidth: 1, borderColor: '#294164', borderRadius: 16, backgroundColor: colors.panel, gap: 16 },
  pressed: { backgroundColor: '#244775' },
  badge: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#193C43', borderRadius: 10 },
  number: { color: colors.mako, fontSize: 12, fontWeight: '700' },
  rowContent: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  description: { color: colors.muted, fontSize: 13, marginTop: 5 },
  arrow: { color: colors.muted, fontSize: 26 },
});
