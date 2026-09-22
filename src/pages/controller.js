import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppHeader from '../components/app_header';
import { Card, Field, PageHeading, PrimaryButton, ui } from '../components/web_ui';
import { saveMovement } from '../services/mobileApi';

export default function Controller({ onMenu, token, user, onHistory }) {
  const [matricula, setMatricula] = useState('');
  const [turma, setTurma] = useState('');
  const [tipo, setTipo] = useState('Saída');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [observacao, setObservacao] = useState('');
  const [review, setReview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data.trim());
  const isoDate = dateMatch ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}` : '';
  const validDate = dateMatch && !Number.isNaN(new Date(`${isoDate}T12:00:00`).getTime())
    && new Date(`${isoDate}T12:00:00`).getDate() === Number(dateMatch[1]);

  const openReview = () => {
    if (!matricula.trim() || !turma.trim() || !validDate || !/^([01]\d|2[0-3]):[0-5]\d$/.test(horario.trim())) {
      Alert.alert('Dados incompletos', 'Preencha matrícula, turma, data (dd/mm/aaaa) e horário (hh:mm).');
      return;
    }
    setReview(true);
  };

  const confirm = async () => {
    setSaving(true);
    try {
      const result = await saveMovement(token, {
        matricula: matricula.trim(), turma: turma.trim(), tipo, data: isoDate,
        horario: horario.trim(), observacao: observacao.trim(),
      });
      setReview(false);
      setMessage(result.mensagem || 'Movimentação registrada com sucesso.');
      setMatricula(''); setTurma(''); setData(''); setHorario(''); setObservacao('');
      setTipo('Saída');
    } catch (error) {
      Alert.alert('Registro não concluído', error.message);
    } finally {
      setSaving(false);
    }
  };

  return <SafeAreaView style={styles.safe}>
    <StatusBar style="light" />
    <AppHeader title="Controle de frequência" onMenu={onMenu} />
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <PageHeading title="Registro de movimentação" subtitle="Registre saídas e retornos dos alunos." badge="Controle de frequência" />
        {message ? <Card style={styles.success}><Text style={styles.successText}>{message}</Text><Pressable onPress={onHistory}><Text style={styles.link}>Ver meu histórico →</Text></Pressable></Card> : null}
        <Card>
          <Text style={styles.section}>Identificação do aluno</Text>
          <Field label="Nome completo" value={user?.nome || ''} editable={false} />
          <Field label="Matrícula *" value={matricula} onChangeText={setMatricula} placeholder="Ex.: 20260001" maxLength={50} />
          <Field label="Turma *" value={turma} onChangeText={setTurma} placeholder="Ex.: 2º ano A" maxLength={100} />
          <View style={styles.divider} />
          <Text style={styles.section}>Detalhes da movimentação</Text>
          <Text style={styles.label}>Tipo de registro *</Text>
          <View style={styles.typeRow}>
            {['Entrada', 'Saída'].map((value) => <Pressable key={value} onPress={() => setTipo(value)} style={[styles.type, tipo === value && styles.selected]}>
              <Text style={[styles.typeText, tipo === value && styles.selectedText]}>{value === 'Entrada' ? '↘' : '↗'}  {value}</Text>
            </Pressable>)}
          </View>
          <Field label="Data *" value={data} onChangeText={setData} placeholder="dd/mm/aaaa" keyboardType="number-pad" maxLength={10} />
          <Field label="Horário *" value={horario} onChangeText={setHorario} placeholder="hh:mm" keyboardType="numbers-and-punctuation" maxLength={5} />
          <Field label="Observação (opcional)" value={observacao} onChangeText={setObservacao} placeholder="Atraso ou saída antecipada..." multiline maxLength={500} style={styles.notes} />
          <Text style={styles.counter}>{observacao.length} / 500 caracteres</Text>
          <View style={styles.actions}>
            <PrimaryButton title="Limpar campos" secondary onPress={() => { setMatricula(''); setTurma(''); setData(''); setHorario(''); setObservacao(''); setMessage(''); }} />
            <PrimaryButton title="Revisar movimentação →" onPress={openReview} />
          </View>
        </Card>
        <Card style={styles.summary}>
          <Text style={styles.section}>Resumo do registro</Text>
          <Text style={styles.summaryType}>{tipo === 'Entrada' ? '↘' : '↗'}  {tipo}</Text>
          <Text style={styles.summaryLine}>Aluno: {user?.nome || '—'}</Text>
          <Text style={styles.summaryLine}>Matrícula: {matricula || 'Não informada'}</Text>
          <Text style={styles.summaryLine}>Turma: {turma || 'Não informada'}</Text>
          <Text style={styles.summaryLine}>Data: {data || '—'} · Horário: {horario || '—'}</Text>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
    <Modal transparent visible={review} animationType="fade" onRequestClose={() => setReview(false)}>
      <View style={styles.modalLayer}><Card style={styles.dialog}>
        <Text style={styles.dialogTitle}>Confira a movimentação</Text>
        <Text style={styles.dialogHint}>Esta é uma prévia. O registro ainda não foi salvo.</Text>
        <Text style={styles.summaryLine}>{tipo} · {user?.nome}</Text>
        <Text style={styles.summaryLine}>Matrícula: {matricula} · Turma: {turma}</Text>
        <Text style={styles.summaryLine}>{data} às {horario}</Text>
        <Text style={styles.summaryLine}>Observação: {observacao || '—'}</Text>
        <View style={styles.actions}><PrimaryButton title="Voltar" secondary onPress={() => setReview(false)} /><PrimaryButton title={saving ? 'Salvando...' : 'Confirmar registro'} disabled={saving} onPress={confirm} /></View>
      </Card></View>
    </Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ui.background }, flex: { flex: 1 }, content: { alignSelf: 'center', maxWidth: 980, padding: 18, paddingBottom: 40, width: '100%' },
  section: { color: ui.text, fontSize: 18, fontWeight: '800', marginBottom: 18 },
  label: { color: ui.text, fontSize: 13, fontWeight: '700', marginBottom: 9 },
  divider: { height: 1, backgroundColor: ui.line, marginVertical: 22 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  type: { flex: 1, minHeight: 54, borderColor: ui.line, borderWidth: 1, borderRadius: 10, backgroundColor: ui.input, alignItems: 'center', justifyContent: 'center' },
  selected: { borderColor: ui.accent, backgroundColor: '#0d3b4d' }, typeText: { color: ui.text, fontWeight: '700' }, selectedText: { color: ui.accentSoft },
  notes: { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 }, counter: { color: ui.muted, fontSize: 11, textAlign: 'right', marginTop: -12, marginBottom: 22 },
  actions: { gap: 10, marginTop: 8 }, summary: { marginTop: 16 }, summaryType: { color: ui.accentSoft, fontSize: 16, fontWeight: '800', marginBottom: 12 },
  summaryLine: { color: ui.text, fontSize: 13, lineHeight: 21, marginBottom: 4 },
  success: { borderColor: ui.accent, marginBottom: 16 }, successText: { color: ui.text, fontWeight: '700' }, link: { color: ui.accentSoft, marginTop: 10, fontWeight: '700' },
  modalLayer: { flex: 1, backgroundColor: '#000a', justifyContent: 'center', padding: 20 }, dialog: { maxWidth: 520, width: '100%', alignSelf: 'center' },
  dialogTitle: { color: ui.text, fontSize: 22, fontWeight: '800' }, dialogHint: { color: ui.muted, fontSize: 13, marginVertical: 14 },
});
