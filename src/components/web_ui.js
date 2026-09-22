import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export const ui = {
  background: '#091522', card: '#14243a', input: '#0a1727', line: '#36526a',
  accent: '#22c7e8', accentSoft: '#6fe8f6', text: '#f5f9ff', muted: '#a3b1c4',
};

export function PageHeading({ title, subtitle, badge }) {
  return <View style={styles.heading}>
    {badge ? <Text style={styles.badge}>{badge}</Text> : null}
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>;
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Field({ label, value, onChangeText, placeholder, style, ...props }) {
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={[styles.input, style]} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#8192a8" {...props} />
  </View>;
}

export function PrimaryButton({ title, onPress, disabled = false, secondary = false }) {
  return <Pressable onPress={onPress} disabled={disabled} style={[styles.button, secondary && styles.secondaryButton, disabled && styles.disabled]}>
    <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{title}</Text>
  </Pressable>;
}

export function StatCard({ label, value, note }) {
  return <Card style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
    {note ? <Text style={styles.statNote}>{note}</Text> : null}
  </Card>;
}

export function MovementCard({ item, formatMoment, minutesOutside }) {
  const minutes = minutesOutside(item);
  return <Card style={styles.movement}>
    <View style={styles.movementTop}>
      <Text style={styles.movementName}>{item.nome}</Text>
      <Text style={[styles.status, !item.retorno && styles.pending]}>{item.retorno ? 'Concluído' : 'Sem retorno'}</Text>
    </View>
    <Text style={styles.movementMeta}>{item.matricula} · {item.turma}</Text>
    <Text style={styles.movementDetail}>Saída: {formatMoment(item.saida)}</Text>
    <Text style={styles.movementDetail}>Retorno: {formatMoment(item.retorno)}</Text>
    <Text style={styles.movementDetail}>Tempo fora: {minutes === null ? '—' : `${minutes} min`}</Text>
    {item.observacao ? <Text style={styles.movementNote}>{item.observacao}</Text> : null}
  </Card>;
}

const styles = StyleSheet.create({
  heading: { marginBottom: 22 }, badge: { color: ui.accentSoft, fontSize: 11, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 9 },
  title: { color: ui.text, fontSize: 30, fontWeight: '800' }, subtitle: { color: ui.muted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  card: { backgroundColor: ui.card, borderColor: ui.line, borderWidth: 1, borderRadius: 16, padding: 18 },
  field: { marginBottom: 18 }, label: { color: ui.text, fontSize: 13, fontWeight: '700', marginBottom: 9 },
  input: { color: ui.text, backgroundColor: ui.input, borderColor: '#3a5066', borderWidth: 1, borderRadius: 10, minHeight: 50, paddingHorizontal: 14, fontSize: 15 },
  button: { backgroundColor: '#13a9ce', borderRadius: 10, minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  secondaryButton: { backgroundColor: ui.input, borderColor: ui.line, borderWidth: 1 },
  buttonText: { color: '#041724', fontSize: 15, fontWeight: '800' }, secondaryText: { color: ui.text }, disabled: { opacity: 0.55 },
  stat: { flex: 1, minWidth: 135 }, statLabel: { color: ui.muted, fontSize: 12, fontWeight: '700' },
  statValue: { color: ui.text, fontSize: 28, fontWeight: '800', marginTop: 9 }, statNote: { color: ui.muted, fontSize: 11, marginTop: 4 },
  movement: { marginBottom: 12 }, movementTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' },
  movementName: { color: ui.text, fontSize: 16, fontWeight: '800', flex: 1 },
  status: { color: ui.accentSoft, backgroundColor: '#0d3b4d', borderRadius: 20, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5, fontSize: 11, fontWeight: '700' },
  pending: { color: '#f2bd7f', backgroundColor: '#423022' }, movementMeta: { color: ui.muted, marginTop: 6, marginBottom: 10 },
  movementDetail: { color: ui.text, fontSize: 13, marginTop: 4 }, movementNote: { color: ui.muted, borderTopColor: ui.line, borderTopWidth: 1, paddingTop: 9, marginTop: 10, fontSize: 13 },
});
