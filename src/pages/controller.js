import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppHeader from '../components/app_header';

const Card = ({ label }) => <View style={styles.card}><Text style={styles.cardText}>{label}</Text><Text style={styles.cardValue}>0</Text></View>;

export default function Controller({ onMenu }) {
  return <SafeAreaView style={styles.safe}><StatusBar style="dark" /><AppHeader title={'Controle de frequ\u00eancia'} onMenu={onMenu} /><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>Sistema escolar</Text>
    <Text style={styles.title}>{'Controle de Frequ\u00eancia'}</Text>
    <Text style={styles.description}>{'Acompanhe as entradas e sa\u00eddas dos alunos de forma r\u00e1pida e organizada.'}</Text>
    <View style={styles.cards}><Card label="Registros hoje" /><Card label="Entradas" /><Card label={'Sa\u00eddas'} /></View>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#FFFFFF', flex: 1 }, content: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 42 },
  eyebrow: { color: '#303743', fontSize: 15, marginBottom: 7 }, title: { color: '#20242A', fontSize: 34, fontWeight: '700', letterSpacing: -0.7, lineHeight: 41 }, description: { color: '#303743', fontSize: 16, lineHeight: 24, marginTop: 9 },
  cards: { marginTop: 28 }, card: { alignItems: 'center', borderColor: '#D9DEE7', borderRadius: 10, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 66, paddingHorizontal: 18, marginBottom: 12 }, cardText: { color: '#303743', fontSize: 16 }, cardValue: { color: '#20242A', fontSize: 22, fontWeight: '700' },
  syncButton: { alignItems: 'center', backgroundColor: '#146CFF', borderRadius: 8, justifyContent: 'center', minHeight: 44, marginTop: 18, marginHorizontal: 24 },
  syncButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.8 },
});
