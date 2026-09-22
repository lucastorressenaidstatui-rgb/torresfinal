import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { getLaravelBase, getLaravelHeaders } from '../services/laravelService';
import { getCurrentUser } from '../services/mobileApi';

export default function Login({ onRegister, onSuccess }) {
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!role || !email.trim() || !password) {
      Alert.alert('Dados incompletos', 'Escolha aluno ou professor e preencha email e senha.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${getLaravelBase()}/login`, {
        method: 'POST',
        headers: getLaravelHeaders(),
        body: JSON.stringify({ email: email.trim(), senha: password, perfil: role }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.erro !== 'n' || !result?.token) {
        throw new Error(result?.mensagem || result?.message || 'Não foi possível entrar.');
      }
      const apiUser = result.usuario || result.user || await getCurrentUser(result.token);
      const user = {
        ...apiUser,
        perfil: apiUser?.perfil || role,
        is_professor: apiUser?.is_professor ?? role === 'professor',
      };
      onSuccess?.({ token: result.token, user });
    } catch (error) {
      Alert.alert('Erro ao entrar', error.message || 'Verifique a conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Text style={styles.brandIcon}>⌁</Text>
            <Text style={styles.brandTitle}>Sistema escolar</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.title}>Bem-vindo</Text>
            <Text style={styles.subtitle}>Entre com sua conta para continuar.</Text>
            <Text style={styles.label}>Você é aluno ou professor?</Text>
            <View style={styles.roleRow}>
              {['Aluno', 'Professor'].map((item) => (
                <Pressable key={item} onPress={() => setRole(item.toLowerCase())} style={[styles.roleButton, role === item.toLowerCase() && styles.roleSelected]}>
                  <Text style={[styles.roleText, role === item.toLowerCase() && styles.roleSelectedText]}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="seu@email.com" placeholderTextColor="#9aa7b8" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            <Text style={styles.label}>Senha</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Digite sua senha" placeholderTextColor="#9aa7b8" secureTextEntry autoComplete="password" />
            <Pressable onPress={submit} disabled={loading} style={[styles.submit, loading && styles.disabled]}>
              {loading ? <ActivityIndicator color="#081b27" /> : <Text style={styles.submitText}>Entrar</Text>}
            </Pressable>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Ainda não tem conta? </Text>
              <Pressable onPress={onRegister}><Text style={styles.link}>Cadastre-se</Text></Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, screen: { flex: 1, backgroundColor: '#0b1723' },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 44 },
  brand: { alignItems: 'center', marginBottom: 28 },
  brandIcon: { color: '#45e1f2', fontSize: 56, fontWeight: '700', lineHeight: 65 },
  brandTitle: { color: '#7deef6', fontSize: 14, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  card: { alignSelf: 'center', width: '100%', maxWidth: 520, backgroundColor: '#172536', borderColor: '#42566c', borderWidth: 1, borderRadius: 24, paddingHorizontal: 26, paddingVertical: 36 },
  title: { color: '#f7f9fd', fontSize: 38, fontWeight: '800', marginBottom: 12 },
  subtitle: { color: '#aeb9c8', fontSize: 16, marginBottom: 32 },
  label: { color: '#f3f6fb', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  roleButton: { flex: 1, borderColor: '#455b70', borderWidth: 1, borderRadius: 12, minHeight: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: '#132131' },
  roleSelected: { borderColor: '#35d9eb', backgroundColor: '#183747' },
  roleText: { color: '#f6f8fc', fontSize: 16, fontWeight: '700' }, roleSelectedText: { color: '#58e3f1' },
  input: { backgroundColor: '#111e2d', borderColor: '#455b70', borderWidth: 1, borderRadius: 12, minHeight: 56, paddingHorizontal: 16, color: '#fff', fontSize: 16, marginBottom: 26 },
  submit: { backgroundColor: '#23c4dc', borderRadius: 12, minHeight: 56, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  disabled: { opacity: 0.65 }, submitText: { color: '#09202d', fontSize: 17, fontWeight: '800' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' },
  footerText: { color: '#aeb9c8', fontSize: 15 }, link: { color: '#a5f3fb', fontSize: 15, fontWeight: '700', textDecorationLine: 'underline' },
});
