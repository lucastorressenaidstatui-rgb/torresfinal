import { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Modal, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppHeader from '../components/app_header';
import { Card, Field, MovementCard, PageHeading, PrimaryButton, StatCard, ui } from '../components/web_ui';
import { getMovements } from '../services/mobileApi';
import { filterMovements, formatMoment, minutesOutside, movementStats } from '../services/movementView';

const toIso = (value) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
};

export default function Registro({ onMenu, token, user, onReport }) {
  const professor = !!user?.is_professor;
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [turma, setTurma] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setMovements(await getMovements(token));
      setError('');
    } catch (problem) {
      setError(problem.message || 'Não foi possível carregar o histórico.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const filtered = useMemo(() => filterMovements(movements, { search, turma, inicio: toIso(inicio), fim: toIso(fim) }), [movements, search, turma, inicio, fim]);
  const stats = movementStats(filtered);
  const classes = [...new Set(movements.map((item) => item.turma))].sort();
  const students = useMemo(() => {
    const groups = new Map();
    for (const item of filtered) {
      const key = item.matricula;
      const current = groups.get(key) || { nome: item.nome, matricula: key, turma: item.turma, movements: [] };
      current.movements.push(item);
      groups.set(key, current);
    }
    return [...groups.values()];
  }, [filtered]);
  const days = useMemo(() => {
    const counts = new Map();
    for (const item of filtered) {
      const day = formatMoment(item.saida).slice(0, 10);
      counts.set(day, (counts.get(day) || 0) + 1);
    }
    return [...counts.entries()].reverse().slice(-7);
  }, [filtered]);
  const maxDay = Math.max(1, ...days.map(([, count]) => count));

  return <SafeAreaView style={styles.safe}>
    <StatusBar style="light" />
    <AppHeader title={professor ? 'Dashboard do professor' : 'Meu histórico'} onMenu={onMenu} />
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={ui.accent} />}>
      <PageHeading title={professor ? 'Dashboard do professor' : 'Meu histórico'}
        subtitle={professor ? 'Acompanhe as saídas e retornos dos alunos.' : `Movimentações registradas na conta de ${user?.nome || 'aluno'}.`}
        badge={professor ? 'Área do professor' : 'Controle de frequência'} />

      {error ? <Card style={styles.error}><Text style={styles.errorText}>{error}</Text><PrimaryButton title="Tentar novamente" onPress={load} /></Card> : null}

      {professor ? <Card style={styles.filters}>
        <Text style={styles.section}>Filtros</Text>
        <Field label="Aluno ou matrícula" value={search} onChangeText={setSearch} placeholder="Buscar aluno..." />
        <Text style={styles.label}>Turma</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {['', ...classes].map((item) => <Pressable key={item || 'all'} onPress={() => setTurma(item)} style={[styles.chip, turma === item && styles.chipActive]}>
            <Text style={[styles.chipText, turma === item && styles.chipTextActive]}>{item || 'Todas as turmas'}</Text>
          </Pressable>)}
        </ScrollView>
        <Field label="De" value={inicio} onChangeText={setInicio} placeholder="dd/mm/aaaa" keyboardType="number-pad" maxLength={10} />
        <Field label="Até" value={fim} onChangeText={setFim} placeholder="dd/mm/aaaa" keyboardType="number-pad" maxLength={10} />
        <View style={styles.filterActions}><PrimaryButton title="Limpar" secondary onPress={() => { setSearch(''); setTurma(''); setInicio(''); setFim(''); }} />
          {onReport ? <PrimaryButton title="Ver relatório" onPress={() => onReport({ search, turma, inicio: toIso(inicio), fim: toIso(fim) })} /> : null}</View>
      </Card> : null}

      <View style={styles.stats}>
        {professor ? <>
          <StatCard label="Total de saídas" value={stats.total} note="No período selecionado" />
          <StatCard label="Alunos que saíram" value={stats.students} />
          <StatCard label="Média por aluno" value={stats.perStudent} />
          <StatCard label="Tempo médio fora" value={stats.averageMinutes === null ? '—' : `${stats.averageMinutes} min`} />
        </> : <>
          <StatCard label="Saídas registradas" value={stats.total} />
          <StatCard label="Retornos registrados" value={stats.returns} />
          <StatCard label="Sem retorno" value={stats.pending} />
        </>}
      </View>

      {professor ? <>
        <Card style={styles.sectionCard}>
          <Text style={styles.section}>Saídas por dia</Text>
          {days.length ? <View style={styles.chart}>{days.map(([day, count]) => <View key={day} style={styles.barColumn}>
            <Text style={styles.barValue}>{count}</Text><View style={[styles.bar, { height: 20 + (count / maxDay) * 95 }]} /><Text style={styles.barLabel}>{day.slice(0, 5)}</Text>
          </View>)}</View> : <Text style={styles.empty}>Nenhuma saída no período.</Text>}
        </Card>
        <Card style={styles.sectionCard}>
          <Text style={styles.section}>Sem retorno registrado · {stats.pending}</Text>
          {filtered.filter((item) => !item.retorno).slice(0, 5).map((item) => <Text key={item.id} style={styles.pendingLine}>{item.nome} · {item.turma} · {formatMoment(item.saida)}</Text>)}
          {!stats.pending ? <Text style={styles.empty}>Nenhum retorno pendente.</Text> : null}
        </Card>
        <Text style={styles.listTitle}>Controle por aluno · {students.length}</Text>
        {students.map((student) => <Pressable key={student.matricula} onPress={() => setSelectedStudent(student)}>
          <Card style={styles.studentCard}>
            <Text style={styles.studentName}>{student.nome}</Text><Text style={styles.studentMeta}>{student.matricula} · {student.turma}</Text>
            <Text style={styles.studentMeta}>{student.movements.length} saídas · {student.movements.filter((item) => !item.retorno).length} pendentes</Text>
            <Text style={styles.studentLink}>Ver histórico →</Text>
          </Card>
        </Pressable>)}
      </> : <Text style={styles.listTitle}>Minhas movimentações</Text>}

      {!professor && filtered.map((item) => <MovementCard key={item.id} item={item} formatMoment={formatMoment} minutesOutside={minutesOutside} />)}
      {!filtered.length && !loading ? <Card><Text style={styles.empty}>{professor ? 'Nenhuma movimentação encontrada.' : 'Você ainda não registrou nenhuma saída.'}</Text></Card> : null}
    </ScrollView>
    <Modal transparent visible={!!selectedStudent} onRequestClose={() => setSelectedStudent(null)}>
      <View style={styles.modalLayer}><Card style={styles.dialog}>
        <Text style={styles.listTitle}>Histórico do aluno</Text>
        <Text style={styles.studentMeta}>{selectedStudent?.nome} · {selectedStudent?.turma}</Text>
        <ScrollView style={styles.dialogScroll}>{selectedStudent?.movements.map((item) => <MovementCard key={item.id} item={item} formatMoment={formatMoment} minutesOutside={minutesOutside} />)}</ScrollView>
        <PrimaryButton title="Fechar" secondary onPress={() => setSelectedStudent(null)} />
      </Card></View>
    </Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ui.background }, content: { alignSelf: 'center', maxWidth: 1120, padding: 18, paddingBottom: 42, width: '100%' },
  filters: { marginBottom: 16 }, section: { color: ui.text, fontSize: 18, fontWeight: '800', marginBottom: 14 },
  label: { color: ui.text, fontSize: 13, fontWeight: '700', marginBottom: 9 }, chips: { marginBottom: 18 },
  chip: { borderColor: ui.line, borderWidth: 1, backgroundColor: ui.input, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 9, marginRight: 8 },
  chipActive: { borderColor: ui.accent, backgroundColor: '#0d3b4d' }, chipText: { color: ui.muted, fontSize: 12, fontWeight: '700' }, chipTextActive: { color: ui.accentSoft },
  filterActions: { gap: 9 }, stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  sectionCard: { marginTop: 15 }, chart: { height: 170, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 10 },
  barColumn: { flex: 1, alignItems: 'center' }, bar: { width: 20, borderRadius: 5, backgroundColor: ui.accent }, barValue: { color: ui.text, fontSize: 11, marginBottom: 5 }, barLabel: { color: ui.muted, fontSize: 10, marginTop: 5 },
  empty: { color: ui.muted, fontSize: 14, lineHeight: 21 }, pendingLine: { color: ui.text, borderTopColor: ui.line, borderTopWidth: 1, paddingVertical: 9, fontSize: 12 },
  listTitle: { color: ui.text, fontSize: 20, fontWeight: '800', marginTop: 22, marginBottom: 13 },
  studentCard: { marginBottom: 10 }, studentName: { color: ui.text, fontWeight: '800', fontSize: 16 }, studentMeta: { color: ui.muted, fontSize: 13, marginTop: 5 }, studentLink: { color: ui.accentSoft, fontSize: 13, marginTop: 10, fontWeight: '700' },
  error: { borderColor: '#c05b5b', marginBottom: 16, gap: 12 }, errorText: { color: '#ffb6b6' },
  modalLayer: { flex: 1, backgroundColor: '#000b', justifyContent: 'center', padding: 18 }, dialog: { maxHeight: '85%', width: '100%', maxWidth: 560, alignSelf: 'center' }, dialogScroll: { marginVertical: 14 },
});
