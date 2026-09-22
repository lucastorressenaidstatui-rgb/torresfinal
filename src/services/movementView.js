export function formatMoment(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

export function minutesOutside(item) {
  if (!item.retorno) return null;
  return Math.round((new Date(item.retorno) - new Date(item.saida)) / 60000);
}

export function filterMovements(items, { search = '', turma = '', inicio = '', fim = '' } = {}) {
  const query = search.trim().toLocaleLowerCase('pt-BR');
  return items.filter((item) => {
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(item.saida));
    return (!query || `${item.nome} ${item.matricula}`.toLocaleLowerCase('pt-BR').includes(query))
      && (!turma || item.turma === turma)
      && (!inicio || date >= inicio)
      && (!fim || date <= fim);
  });
}

export function movementStats(items) {
  const students = new Set(items.map((item) => item.matricula));
  const completed = items.map(minutesOutside).filter((value) => value !== null);
  return {
    total: items.length,
    students: students.size,
    pending: items.filter((item) => !item.retorno).length,
    returns: items.filter((item) => !!item.retorno).length,
    perStudent: students.size ? (items.length / students.size).toFixed(1).replace('.', ',') : '—',
    averageMinutes: completed.length ? Math.round(completed.reduce((sum, value) => sum + value, 0) / completed.length) : null,
  };
}
