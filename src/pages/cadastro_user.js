import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AlertBanner from '../components/alert_banner';
import { saveUserToLaravel, buildUserPayload } from '../services/laravelService';

const Field = ({ label, children }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);

const Input = (props) => <TextInput placeholderTextColor="#9aa7b8" style={styles.input} {...props} />;

export default function CadastroUser({ onBack, onMenu }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [perfil, setPerfil] = useState(null);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState({ visible: false, type: 'success', title: '', message: '' });

  const showBanner = (type, title, message) => {
    setBanner({ visible: true, type, title, message });
  };

  const submit = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim() || !dataNascimento.trim() || !cpf.trim() || !perfil) {
      showBanner('error', 'Dados incompletos', 'Preencha todos os campos para concluir o cadastro.');
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailValido) {
      showBanner('error', 'E-mail inválido', 'Informe um e-mail válido para continuar.');
      return;
    }

    if (senha.trim().length < 6) {
      showBanner('error', 'Senha inválida', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (cpf.replace(/\D/g, '').length !== 11) {
      showBanner('error', 'CPF inválido', 'Informe um CPF com 11 dígitos.');
      return;
    }

    const matchData = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dataNascimento.trim());
    if (!matchData || Number(matchData[2]) < 1 || Number(matchData[2]) > 12 || Number(matchData[1]) < 1 || Number(matchData[1]) > 31) {
      showBanner('error', 'Data inválida', 'Informe a data no formato dd/mm/aaaa.');
      return;
    }

    setSaving(true);
    try {
      const payload = buildUserPayload({ nome, email, senha, dataNascimento, cpf, perfil });
      const response = await saveUserToLaravel(payload);
      const mensagem = response?.mensagem || response?.message || 'Usuário cadastrado com sucesso.';

      // saveUserToLaravel lança uma exceção quando a API informa erro.
      // Portanto, qualquer resposta resolvida aqui representa cadastro concluído.
      showBanner('success', 'Cadastro realizado!', mensagem);
      setNome('');
      setEmail('');
      setSenha('');
      setDataNascimento('');
      setCpf('');
      setPerfil(null);
    } catch (error) {
      showBanner('error', 'Cadastro não concluído', error.message || 'Não foi possível salvar o cadastro no Laravel.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <AlertBanner
        visible={banner.visible}
        type={banner.type}
        title={banner.title}
        message={banner.message}
        onClose={() => setBanner((atual) => ({ ...atual, visible: false }))}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={onBack} style={styles.back}>
            <Text style={styles.backText}>← Voltar para entrar</Text>
          </Pressable>

          <View style={styles.headerCard}>
            <Text style={styles.eyebrow}>Cadastro</Text>
            <Text style={styles.title}>Crie sua conta</Text>
            <Text style={styles.description}>Preencha seus dados para continuar.</Text>
          </View>

          <View style={styles.box}>
            <View style={styles.form}>
              <Field label="Você é aluno ou professor?">
                <View style={styles.profileRow}>
                  {['aluno', 'professor'].map((item) => (
                    <Pressable key={item} onPress={() => setPerfil(item)} style={[styles.profileButton, perfil === item && styles.profileSelected]}>
                      <Text style={[styles.profileText, perfil === item && styles.profileSelectedText]}>{item === 'aluno' ? 'Aluno' : 'Professor'}</Text>
                    </Pressable>
                  ))}
                </View>
              </Field>
              <Field label="Nome completo">
                <Input
                  value={nome}
                  onChangeText={setNome}
                  autoCapitalize="words"
                  placeholder="Digite seu nome completo"
                  autoComplete="name"
                />
              </Field>

              <Field label="E-mail">
                <Input
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="Digite seu e-mail"
                  autoComplete="email"
                />
              </Field>

              <Field label="Senha">
                <Input
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry
                  placeholder="Crie uma senha"
                  autoComplete="new-password"
                />
              </Field>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Field label="Data de nascimento">
                    <Input
                      value={dataNascimento}
                      onChangeText={setDataNascimento}
                      placeholder="dd/mm/aaaa"
                      keyboardType="number-pad"
                    />
                  </Field>
                </View>

                <View style={styles.half}>
                  <Field label="CPF">
                    <Input
                      value={cpf}
                      onChangeText={setCpf}
                      placeholder="Digite seu CPF"
                      keyboardType="number-pad"
                    />
                  </Field>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Pressable disabled={saving} onPress={submit} style={[styles.submit, saving && styles.disabled]}>
                  {saving ? <ActivityIndicator color="#09202d" /> : <Text style={styles.submitText}>Cadastrar</Text>}
                </Pressable>

                <Pressable onPress={onBack} style={styles.secondaryButton}>
                  <Text style={styles.secondaryText}>Já tenho uma conta</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#0b1723', flex: 1 },
  keyboard: { flex: 1 },
  content: { alignSelf: 'center', maxWidth: 760, paddingHorizontal: 20, paddingTop: 48, paddingBottom: 38, width: '100%' },
  back: { alignSelf: 'flex-start', marginBottom: 14 },
  backText: { color: '#a5f3fb', fontSize: 15, fontWeight: '700' },
  headerCard: {
    backgroundColor: '#172536',
    borderColor: '#42566c',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  eyebrow: { color: '#58e3f1', fontSize: 12, fontWeight: '800', letterSpacing: 1.3, textTransform: 'uppercase' },
  title: { color: '#f7f9fd', fontSize: 34, fontWeight: '800', marginTop: 8 },
  description: { color: '#aeb9c8', fontSize: 15, lineHeight: 22, marginTop: 8 },
  box: {
    backgroundColor: '#172536',
    borderColor: '#42566c',
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  form: { marginTop: 6 },
  field: { marginBottom: 18 },
  profileRow: { flexDirection: 'row', gap: 12 },
  profileButton: { flex: 1, minHeight: 50, borderColor: '#455b70', borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111e2d' },
  profileSelected: { borderColor: '#35d9eb', backgroundColor: '#183747' },
  profileText: { color: '#f3f6fb', fontSize: 16, fontWeight: '700' },
  profileSelectedText: { color: '#58e3f1' },
  label: { color: '#f3f6fb', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: {
    backgroundColor: '#111e2d',
    borderColor: '#455b70',
    borderRadius: 12,
    borderWidth: 1,
    color: '#ffffff',
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  row: { flexDirection: 'row', marginHorizontal: -6 },
  half: { flex: 1, paddingHorizontal: 6 },
  actionRow: { marginTop: 8 },
  submit: {
    alignItems: 'center',
    backgroundColor: '#23c4dc',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 52,
    marginBottom: 12,
  },
  submitText: { color: '#09202d', fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.65 },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#455b70',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    backgroundColor: '#132131',
  },
  secondaryText: { color: '#f3f6fb', fontSize: 16, fontWeight: '600' },
});
