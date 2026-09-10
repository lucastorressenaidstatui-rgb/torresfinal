import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AppHeader from '../components/app_header';

const Field = ({ label, children }) => <View style={styles.field}><Text style={styles.label}>{label}</Text>{children}</View>;
const Input = (props) => <TextInput placeholderTextColor="#758197" style={styles.input} {...props} />;

export default function CadastroUser({ onBack, onMenu }) {
  const [nome, setNome] = useState(''); const [matricula, setMatricula] = useState(''); const [turma, setTurma] = useState('Selecione a turma'); const [tipo, setTipo] = useState('Entrada'); const [data, setData] = useState(''); const [horario, setHorario] = useState(''); const [observacao, setObservacao] = useState('');
  const selectTurma = () => { const options = ['Selecione a turma', '1\u00ba Ano A', '2\u00ba Ano A', '3\u00ba Ano A']; setTurma(options[(options.indexOf(turma) + 1) % options.length]); };
  const submit = () => { if (!nome.trim() || !matricula.trim() || turma === 'Selecione a turma') return Alert.alert('Dados incompletos', 'Preencha o nome, a matr\u00edcula e a turma do aluno.'); return Alert.alert('Frequ\u00eancia registrada', `${tipo} de ${nome.trim()} registrada com sucesso.`); };
  return <SafeAreaView style={styles.safe}><StatusBar style="dark" /><AppHeader title={'Registrar movimenta\u00e7\u00e3o'} onMenu={onMenu} /><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Pressable onPress={onBack} style={styles.back}><Text style={styles.backText}>Voltar</Text></Pressable>
    <Text style={styles.eyebrow}>{'Controle de frequ\u00eancia'}</Text><Text style={styles.title}>{'Registrar movimenta\u00e7\u00e3o'}</Text><Text style={styles.description}>Preencha os dados do aluno e confirme o registro.</Text>
    <View style={styles.form}>
      <Field label="Nome completo do aluno"><Input value={nome} onChangeText={setNome} autoCapitalize="words" placeholder="Ex.: Ana Clara Silva" /></Field>
      <Field label={'Matr\u00edcula'}><Input value={matricula} onChangeText={setMatricula} keyboardType="number-pad" placeholder="Ex.: 202600123" /></Field>
      <Field label="Turma"><Pressable onPress={selectTurma} style={styles.select}><Text style={styles.selectText}>{turma}</Text><Text>v</Text></Pressable></Field>
      <Field label="Tipo de registro"><Pressable onPress={() => setTipo(tipo === 'Entrada' ? 'Sa\u00edda' : 'Entrada')} style={styles.select}><Text style={styles.selectText}>{tipo}</Text><Text>v</Text></Pressable></Field>
      <View style={styles.row}><View style={styles.half}><Field label="Data"><Input value={data} onChangeText={setData} keyboardType="number-pad" maxLength={10} placeholder="dd/mm/aaaa" /></Field></View><View style={styles.half}><Field label={'Hor\u00e1rio'}><Input value={horario} onChangeText={setHorario} keyboardType="numbers-and-punctuation" maxLength={5} placeholder="--:--" /></Field></View></View>
      <Field label={'Observa\u00e7\u00e3o (opcional)'}><Input value={observacao} onChangeText={setObservacao} multiline placeholder={'Ex.: aluno liberado mais cedo pela coordena\u00e7\u00e3o.'} style={[styles.input, styles.notes]} textAlignVertical="top" /></Field>
      <Pressable onPress={submit} style={styles.submit}><Text style={styles.submitText}>{'Registrar frequ\u00eancia'}</Text></Pressable>
    </View>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#FFFFFF', flex: 1 },
  keyboard: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 42 },
  back: { alignSelf: 'flex-start', marginBottom: 22, paddingVertical: 6 },
  backText: { color: '#146CFF', fontSize: 16, fontWeight: '700' },
  eyebrow: { color: '#303743', fontSize: 15, marginBottom: 7 },
  title: { color: '#20242A', fontSize: 30, fontWeight: '700', lineHeight: 37 },
  description: { color: '#303743', fontSize: 16, lineHeight: 23, marginTop: 7 },
  form: { marginTop: 30 },
  field: { marginBottom: 20 },
  label: { color: '#20242A', fontSize: 16, marginBottom: 9 },
  input: { borderColor: '#D9DEE7', borderRadius: 8, borderWidth: 1, color: '#20242A', fontSize: 16, height: 51, paddingHorizontal: 15 },
  select: { alignItems: 'center', borderColor: '#D9DEE7', borderRadius: 8, borderWidth: 1, flexDirection: 'row', height: 51, justifyContent: 'space-between', paddingHorizontal: 15 },
  selectText: { color: '#20242A', fontSize: 16 },
  row: { flexDirection: 'row' },
  half: { flex: 1, paddingHorizontal: 6 },
  notes: { height: 96, paddingTop: 13 },
  submit: { alignItems: 'center', backgroundColor: '#146CFF', borderRadius: 8, justifyContent: 'center', minHeight: 51 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
