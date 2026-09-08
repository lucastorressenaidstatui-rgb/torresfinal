import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppHeader from '../components/app_header';

const columns = ['Aluno', 'Matr\u00edcula', 'Turma', 'Movimenta\u00e7\u00e3o', 'Data e hor\u00e1rio', 'Observa\u00e7\u00e3o'];

export default function Registro({ onMenu }) {
  const [registros, setRegistros] = useState([]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <AppHeader title="Registros do dia" onMenu={onMenu} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Registros do dia</Text>
        <Text style={styles.description}>{'Hist\u00f3rico das movimenta\u00e7\u00f5es cadastradas nesta sess\u00e3o.'}</Text>
        <Pressable onPress={() => setRegistros([])} style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
          <Text style={styles.clearButtonText}>Limpar lista</Text>
        </Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
          <View style={styles.table}>
            <View style={styles.headerRow}>{columns.map((column) => <Text key={column} style={styles.headerCell}>{column}</Text>)}</View>
            {registros.length === 0 ? <View style={styles.emptyRow}><Text style={styles.emptyText}>Nenhum registro realizado ainda.</Text></View> : null}
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#FFFFFF', flex: 1 },
  content: { paddingBottom: 40, paddingHorizontal: 22, paddingTop: 26 },
  title: { color: '#20242A', fontSize: 32, fontWeight: '700', letterSpacing: -0.6, lineHeight: 40 },
  description: { color: '#303743', fontSize: 16, lineHeight: 24, marginTop: 8 },
  clearButton: { alignItems: 'center', alignSelf: 'flex-start', borderColor: '#146CFF', borderRadius: 6, borderWidth: 1, justifyContent: 'center', marginTop: 22, minHeight: 40, paddingHorizontal: 13 },
  clearButtonText: { color: '#146CFF', fontSize: 15, fontWeight: '600' },
  tableScroll: { marginTop: 14 },
  table: { minWidth: 790 },
  headerRow: { borderBottomColor: '#D9DEE7', borderBottomWidth: 1, flexDirection: 'row', paddingBottom: 12, paddingHorizontal: 10 },
  headerCell: { color: '#111827', fontSize: 16, fontWeight: '700', width: 145 },
  emptyRow: { borderBottomColor: '#D9DEE7', borderBottomWidth: 1, minHeight: 51, justifyContent: 'center', paddingHorizontal: 10 },
  emptyText: { color: '#303743', fontSize: 16 },
  pressed: { opacity: 0.72 },
});
