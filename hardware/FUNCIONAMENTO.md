# Executar o app

Este projeto Expo usa os recursos do dispositivo diretamente; não depende de uma API de backend.

```powershell
cd hardware
npm install
npm start
```

Este projeto usa a porta **8090**, em modo LAN e Expo Go.

No celular conectado à mesma rede do computador, abra **exp://10.122.35.39:8090** no Expo Go compatível com SDK 57. No navegador do celular, abra **http://10.122.35.39:8090**. No computador do servidor, abra http://localhost:8090. Se o IP do computador mudar, use o novo endereço mostrado pelo Expo.

No navegador, câmera, GPS, sensores e notificações dependem de suporte, permissões e contexto seguro (HTTPS ou localhost). Um endereço HTTP da rede, como http://10.122.35.84:8082, não habilita esses recursos. O computador desta sessão usa 10.122.35.39; o endereço .84 pertence a outro servidor.

Após alterar os plugins de permissões em app.json, gere e instale novamente o app nativo para aplicar a configuração. Arquivos em dist-ff7 são saídas antigas de compilação: edite os arquivos em pages e components.

Para gerar saídas atualizadas:

```powershell
npx expo export --platform all --output-dir dist-functional
```

A exportação gera bundles, não um APK. O servidor Expo compila diretamente os fontes; não usa dist-ff7.

## Verificação no dispositivo

- Câmera: permitir acesso, tirar foto, salvar e voltar à câmera. Na web, salvar solicita um download; no app nativo, salva na galeria após autorização.
- GPS: buscar localização, autorizar acesso e abrir o mapa. Permissão negada ou GPS desligado deve produzir uma mensagem.
- Áudio: reproduzir e pausar.
- Sensor: ativar em um celular compatível e movimentar o dispositivo; sem sensor, exibir indisponibilidade.
- Notificações: autorizar e aguardar 10 segundos. Na web, manter a tela aberta; navegadores sem suporte informam a limitação.

Compilar com sucesso não valida permissões ou hardware real; esses passos precisam ser conferidos no dispositivo de destino.

## Expo Go e notificações

O módulo `services/localNotifications.native.js` importa somente as APIs locais da versão instalada de expo-notifications. Importar a raiz do pacote também inicializava o registro de tokens push e causava a tela vermelha no Expo Go Android. Mantenha esses imports isolados e execute `npm run test:e2e` após atualizar o SDK; o teste Android verifica que o bundle não inclui esse registro. Os caminhos internos da biblioteca devem ser conferidos em cada atualização.

Após esta correção, feche a tela de erro e reabra `exp://10.122.35.39:8090` no Expo Go para carregar o bundle atualizado.
