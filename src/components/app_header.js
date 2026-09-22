import { Platform, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { ui } from './web_ui';

export default function AppHeader({ title, onMenu }) {
  return <View style={styles.header}>
    <Pressable accessibilityLabel="Abrir menu" accessibilityRole="button" hitSlop={10} onPress={onMenu} style={styles.menuButton}>
      <Text style={styles.menuIcon}>☰</Text>
    </Pressable>
    <Text numberOfLines={1} style={styles.title}>{title}</Text>
    <View style={styles.balance} />
  </View>;
}

const styles = StyleSheet.create({
  header: { height: Platform.OS === 'android' ? 62 + (StatusBar.currentHeight || 0) : 62, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0, backgroundColor: '#0b1524', borderBottomColor: ui.line, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  menuButton: { width: 44, height: 44, justifyContent: 'center' },
  menuIcon: { color: ui.accentSoft, fontSize: 24 },
  title: { color: ui.text, fontSize: 16, fontWeight: '800', flex: 1, textAlign: 'center' },
  balance: { width: 44 },
});
