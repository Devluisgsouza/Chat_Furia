<h1 align="center">🐾 CHAT FURIA</h1>
<p align="center"><em>Assistente de chat não-oficial feito por um fã do time de CS da FURIA.</em></p>

<p align="center">
  <a href="https://chat-furia.netlify.app/">🌐 Acessar o site</a> ·
  <a href="#-funcionalidades">Funcionalidades</a> ·
  <a href="#-como-rodar-localmente">Rodar localmente</a> ·
  <a href="#-api">API</a>
</p>

---

## 📕 Sobre

O **CHAT FURIA** é um chat web direcionado aos fãs do time de **Counter-Strike** da FURIA.
Ele responde perguntas sobre partidas, line-up, história, loja, transmissões e redes sociais
através de uma base de conhecimento com reconhecimento de intenções por palavras-chave.

A interface foi reconstruída com um visual profissional, escuro e **totalmente responsivo**
(funciona muito bem no celular).

## ✨ Funcionalidades

- 💬 Interface de chat moderna com bolhas, horários e indicador de "digitando".
- 🧠 Respostas amplas sobre: **partidas, line-up, história/títulos, loja, onde assistir, redes sociais e contato**.
- 🔴 **Dados ao vivo, grátis e sem chave de API**: próximas partidas, últimos resultados
  (placar, adversário e torneio) e **line-up atual** (titulares + comissão técnica, com bandeiras)
  buscados em tempo real da Draft5 pela função serverless.
- ⚡ **Respostas rápidas** (sugestões clicáveis) para começar a conversa.
- 🔌 **API serverless** (Netlify Functions) que serve as respostas — com *fallback* automático
  para a base local caso o backend não esteja disponível (ex.: ao abrir via Live Server).
- 📱 Layout responsivo, acessível (ARIA) e com suporte a `prefers-reduced-motion`.
- 🛡️ Mensagens do usuário são escapadas (sem risco de XSS).

## 🗂️ Estrutura

```
.
├── index.html               # Marcação semântica da interface
├── style.css                # Estilos (tema escuro, responsivo)
├── main.js                  # Lógica do front-end (API + fallback local)
├── knowledge.js             # Base de conhecimento compartilhada (UMD: browser + Node)
├── liveData.js              # Coleta de dados ao vivo da Draft5 (servidor)
├── netlify/
│   └── functions/
│       └── chat.js          # API serverless: POST /api/chat (+ dados ao vivo)
├── netlify.toml             # Build e redirects (/api/* → functions)
└── assets/                  # Logo e imagem de fundo
```

> A base de conhecimento (`knowledge.js`) é **compartilhada** entre o navegador e a função
> serverless, garantindo respostas consistentes nos dois lados.

## 🚀 Como rodar localmente

**Opção 1 — Estático (rápido):**

Abra o `index.html` com a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) do VSCode.
O chat funciona usando a base de conhecimento local (sem backend).

**Opção 2 — Com a API (Netlify Dev):**

```bash
npm install -g netlify-cli
netlify dev
```

Isso sobe o site **e** a função serverless em `/api/chat`.

## 🔌 API

`POST /api/chat`

```json
// Requisição
{ "message": "qual o line-up?" }

// Resposta
{
  "response": "👥 Line-up de CS2 da FURIA ...",
  "intent": "lineup",
  "matched": true,
  "live": false
}
```

Para `intent` igual a `partidas`, `resultados` ou `lineup`, a API busca os dados em tempo
real na Draft5 e retorna `"live": true`. Se a fonte estiver indisponível, cai automaticamente
para a resposta estática com os links oficiais (`"live": false`).

## 🧰 Tecnologias

- HTML5 semântico + acessibilidade (ARIA)
- CSS3 (Flexbox, variáveis, responsividade, animações)
- JavaScript (vanilla, modular)
- Netlify Functions (Node.js)

## 🤝 Como contribuir

```bash
git clone https://github.com/Devluisgsouza/Chat_Furia.git
```

Abra um PR ou uma issue com sugestões. Toda contribuição é bem-vinda! 🖤

---

<p align="center">Feito com 🖤 por um fã · <strong>#VAIFURIA</strong></p>
