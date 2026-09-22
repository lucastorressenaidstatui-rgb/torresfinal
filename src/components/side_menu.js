import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ui } from './web_ui';

export default function SideMenu({ visible, activePage, user, onClose, onSelect, onLogout }) {
  const items = user?.is_professor
    ? [{ id: 'registro', label: 'Dashboard e registros' }, { id: 'controle', label: 'Nova movimentação' }]
    : [{ id: 'controle', label: 'Registrar movimentação' }, { id: 'registro', label: 'Meu histórico' }];

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.layer}>
        <View style={styles.panel}>
          <View style={styles.top}>
            <View style={styles.brandWrap}>
              <Text style={styles.brand}>Sistema escolar</Text>
              <Text style={styles.user} numberOfLines={1}>{user?.nome || 'Usuário'}</Text>
            </View>
            <Pressable accessibilityLabel="Fechar menu" onPress={onClose} style={styles.closeButton}><Text style={styles.close}>×</Text></Pressable>
          </View>
          <Text style={styles.caption}>NAVEGAÇÃO</Text>
          {items.map((item) => (
            <Pressable key={item.id} onPress={() => onSelect(item.id)} style={[styles.item, activePage === item.id && styles.itemActive]}>
              <Text style={[styles.itemText, activePage === item.id && styles.itemTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
          <View style={styles.footer}>
            <Pressable onPress={onLogout} style={styles.logout}><Text style={styles.logoutText}>Sair da conta</Text></Pressable>
          </View>
        </View>
        <Pressable accessibilityLabel="Fechar menu" style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  layer: { flex: 1, flexDirection: 'row' },
  backdrop: { backgroundColor: 'rgba(0, 5, 12, 0.72)', flex: 1 },
  panel: { backgroundColor: ui.card, borderRightColor: ui.line, borderRightWidth: 1, minHeight: '100%', paddingHorizontal: 20, paddingTop: 56, width: 300 },
  top: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 38 },
  brandWrap: { flex: 1, paddingRight: 8 },
  brand: { color: ui.text, fontSize: 18, fontWeight: '800' },
  user: { color: ui.muted, fontSize: 13, marginTop: 6 },
  closeButton: { alignItems: 'center', height: 38, justifyContent: 'center', width: 38 },
  close: { color: ui.accentSoft, fontSize: 28, lineHeight: 30 },
  caption: { color: ui.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 10 },
  item: { borderRadius: 10, marginBottom: 7, paddingHorizontal: 14, paddingVertical: 15 },
  itemActive: { backgroundColor: '#0d3b4d', borderColor: ui.accent, borderWidth: 1 },
  itemText: { color: ui.text, fontSize: 15 },
  itemTextActive: { color: ui.accentSoft, fontWeight: '800' },
  footer: { borderTopColor: ui.line, borderTopWidth: 1, marginTop: 24, paddingTop: 18 },
  logout: { borderColor: ui.line, borderRadius: 10, borderWidth: 1, padding: 14 },
  logoutText: { color: '#ffb6b6', fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
