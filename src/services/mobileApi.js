import { getLaravelBase, getLaravelHeaders } from './laravelService';

async function request(path, token, options = {}) {
  const response = await fetch(`${getLaravelBase()}/mobile${path}`, {
    ...options,
    headers: {
      ...getLaravelHeaders(),
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const validation = body?.errors ? Object.values(body.errors).flat()[0] : null;
    throw new Error(validation || body?.mensagem || body?.message || `Erro ${response.status} ao acessar o Laravel.`);
  }

  return body;
}

export const getCurrentUser = (token) => request('/me', token).then((body) => body.usuario);
export const getMovements = (token) => request('/movimentacoes', token).then((body) => body.movimentacoes || []);
export const saveMovement = (token, data) => request('/movimentacoes', token, {
  method: 'POST',
  body: JSON.stringify(data),
});
