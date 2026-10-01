const { test, expect } = require('@playwright/test');

test('carrega os cinco módulos sem erro JavaScript', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  for (const name of ['Áudio', 'Câmera', 'Acelerômetro', 'GPS', 'Notificação']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('GPS começa sem coordenadas e mapa fica desabilitado', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'GPS', exact: true }).click();
  await expect(page.getByText('Meu GPS', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Abrir no Google Maps' })).toBeDisabled();
});

test('áudio reproduz e pausa', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Áudio', exact: true }).click();
  await page.getByRole('radio', { name: 'Futebol', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Futebol', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Reproduzir áudio', exact: true }).click();
  await expect(page.getByText('Reproduzindo áudio', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pausar', exact: true })).toBeDisabled();
});

test('som escolhido no áudio é usado na notificação', async ({ page }) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      window.lastSoundSource = this.currentSrc || this.src;
      return play.call(this);
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Áudio', exact: true }).click();
  await page.getByRole('radio', { name: 'Futebol', exact: true }).click();
  await page.getByRole('button', { name: 'Reproduzir áudio', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.lastSoundSource)).toContain('bolinha');
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await page.getByRole('button', { name: /back|voltar/i }).click();
  await page.getByRole('button', { name: 'Notificação', exact: true }).click();
  await page.evaluate(() => { window.lastSoundSource = ''; });
  await page.getByRole('button', { name: 'Tocar notificação' }).click();
  await expect.poll(() => page.evaluate(() => window.lastSoundSource)).toContain('bolinha');
});

test('sensor sem dados não indica nível confirmado', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Acelerômetro', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Ativar sensor' })).toBeVisible();
  await expect(page.getByText('✅ Nivelado', { exact: true })).toHaveCount(0);
});

test('notificação toca a cada clique sem pedir permissão', async ({ page }) => {
  await page.addInitScript(() => {
    window.notificationPlays = 0;
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      window.notificationPlays++;
      window.notificationAudio = this;
      return play.call(this);
    };
    window.Notification.requestPermission = async () => { throw new Error('Não deve pedir permissão'); };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Notificação', exact: true }).click();
  for (let count = 1; count <= 3; count++) {
    await page.getByRole('button', { name: 'Tocar notificação', exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.notificationPlays)).toBe(count);
    await expect.poll(() => page.evaluate(() => !!window.notificationAudio && !window.notificationAudio.paused && window.notificationAudio.currentTime > 0)).toBe(true);
    await page.waitForTimeout(700);
  }
  await expect(page.getByText('Não foi possível tocar o som. Tente novamente.')).toHaveCount(0);
});

test('bundle Android inclui o alerta sonoro sem inicializar tokens push', async ({ request }) => {
  test.setTimeout(90000);
  const response = await request.get('/index.bundle?platform=android&dev=true&hot=false&lazy=false', { timeout: 80000 });
  expect(response.ok()).toBeTruthy();
  const bundle = await response.text();
  expect(bundle).toContain('notification.wav');
  expect(bundle).not.toContain('warnOfExpoGoPushUsage');
  expect(bundle).not.toContain('DevicePushTokenAutoRegistration');
});

test('grava pelo microfone, reproduz, pausa e apaga a mensagem de voz', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('/');
  await page.getByRole('button', { name: 'Áudio', exact: true }).click();
  await page.getByRole('button', { name: 'Gravar meu áudio', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Parar gravação' })).toBeVisible();
  await expect(page.getByText('00:02', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Parar gravação' }).click();
  await expect(page.getByRole('button', { name: 'Ouvir minha gravação' })).toBeVisible();
  await page.getByRole('button', { name: 'Ouvir minha gravação' }).click();
  await expect(page.getByRole('button', { name: 'Pausar minha gravação' })).toBeVisible();
  await page.getByRole('button', { name: 'Pausar minha gravação' }).click();
  await expect(page.getByRole('button', { name: 'Ouvir minha gravação' })).toBeVisible();
  await page.getByRole('button', { name: 'Apagar gravação' }).click();
  await expect(page.getByRole('button', { name: 'Ouvir minha gravação' })).toHaveCount(0);
});

test('falha de acesso ao microfone informa o problema e libera nova tentativa', async ({ page }) => {
  await page.addInitScript(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Microfone bloqueado', 'NotAllowedError'); }; });
  await page.goto('/');
  await page.getByRole('button', { name: 'Áudio', exact: true }).click();
  await page.getByRole('button', { name: 'Gravar meu áudio' }).click();
  await expect(page.getByText(/Permita o acesso ao microfone|Não foi possível iniciar a gravação/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Gravar meu áudio' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Ouvir minha gravação' })).toHaveCount(0);
});
