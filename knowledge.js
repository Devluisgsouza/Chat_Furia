/**
 * Base de conhecimento do CHAT FURIA.
 *
 * Módulo UMD: funciona tanto no navegador (window.FuriaKnowledge)
 * quanto no Node.js / Netlify Functions (require('./knowledge')).
 *
 * Toda a lógica de respostas vive aqui para ser compartilhada entre o
 * front-end (fallback offline) e a API serverless.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.FuriaKnowledge = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /** Remove acentos e normaliza para facilitar a comparação de palavras-chave. */
  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim();
  }

  /**
   * Intents do chatbot.
   * Cada intent tem palavras-chave e uma resposta rica (HTML confiável).
   * A ordem importa: intents mais específicas devem vir antes das genéricas.
   */
  var intents = [
    {
      id: "saudacao",
      keywords: ["ola", "oi", "eai", "e ai", "hi", "hello", "fala", "salve", "bom dia", "boa tarde", "boa noite", "opa"],
      response:
        "Salve, FURIOSO! 🐾 Eu sou o <strong>CHAT FURIA</strong>, seu assistente não-oficial feito por um fã.<br><br>" +
        "Posso te ajudar com:<br>" +
        "• 📅 Próximas partidas e resultados <em>(ao vivo!)</em><br>" +
        "• 👥 Line-up atual e jogadores<br>" +
        "• 🏆 História e títulos<br>" +
        "• 🛒 Loja oficial e produtos<br>" +
        "• 📺 Onde assistir e redes sociais<br><br>" +
        "É só perguntar ou tocar em uma das sugestões abaixo. #DIADEFURIA"
    },
    {
      id: "partidas",
      keywords: ["partida", "partidas", "jogo", "jogos", "joga", "horario", "agenda", "calendario", "proxima", "proximas", "quando joga", "campeonato", "torneio", "major", "ao vivo", "agendada", "agendados"],
      response:
        "📅 <strong>Partidas da FURIA</strong><br><br>" +
        "A agenda muda toda semana, então a fonte mais confiável e atualizada é a Draft5 e a Liquipedia:<br>" +
        "• Próximos jogos &amp; resultados → <a href='https://draft5.gg/equipe/330-FURIA/proximas-partidas' target='_blank' rel='noopener'>draft5.gg/FURIA</a><br>" +
        "• Calendário completo (CS2) → <a href='https://liquipedia.net/counterstrike/FURIA' target='_blank' rel='noopener'>Liquipedia</a><br><br>" +
        "Quer saber onde assistir? Me pergunte por <em>\"onde assistir\"</em>. 🔥"
    },
    {
      id: "resultados",
      keywords: ["resultado", "resultados", "placar", "ganhou", "perdeu", "venceu", "ultimo jogo", "ultima partida", "ultimos jogos", "como foi", "vitoria", "derrota"],
      response:
        "📊 <strong>Resultados da FURIA</strong><br><br>" +
        "Confira os placares e o histórico completo da equipe na Draft5:<br>" +
        "➡️ <a href='https://draft5.gg/equipe/330-FURIA' target='_blank' rel='noopener'>draft5.gg/FURIA</a><br><br>" +
        "Quer saber dos próximos jogos? Me pergunte por <em>\"próximas partidas\"</em>. 🐾"
    },
    {
      id: "lineup",
      keywords: ["line", "lineup", "line-up", "elenco", "jogador", "jogadores", "time", "equipe", "roster", "quem joga", "fallen", "kscerato", "yuurih", "molodoy", "yekindar", "skullz", "chelo", "capitao", "igl"],
      response:
        "👥 <strong>Line-up de CS2 da FURIA</strong><br><br>" +
        "O núcleo histórico da equipe é formado por nomes como <strong>FalleN</strong>, <strong>KSCERATO</strong> e <strong>yuurih</strong>, " +
        "referências do CS brasileiro. Como o cenário tem trocas frequentes, confira sempre a escalação oficial atualizada:<br>" +
        "• Elenco atual → <a href='https://liquipedia.net/counterstrike/FURIA' target='_blank' rel='noopener'>Liquipedia / FURIA</a><br>" +
        "• Perfil oficial → <a href='https://www.furia.gg' target='_blank' rel='noopener'>furia.gg</a><br><br>" +
        "Quer saber dos próximos jogos do time? É só perguntar! 🐾"
    },
    {
      id: "sobre",
      keywords: ["sobre", "historia", "quem e", "o que e", "furia", "organizacao", "fundacao", "fundada", "titulo", "titulos", "conquista", "conquistas", "premio"],
      response:
        "🏆 <strong>Sobre a FURIA Esports</strong><br><br>" +
        "A FURIA é uma das maiores organizações de esports do Brasil, fundada em 2017. " +
        "Ficou conhecida mundialmente pelo time de <strong>Counter-Strike</strong>, com um estilo de jogo agressivo que marcou presença em diversos Majors e no topo do ranking mundial.<br><br>" +
        "Hoje a organização atua em vários jogos (CS2, Valorant, LoL, Rocket League e mais) e tem uma das maiores torcidas do cenário. 🖤<br><br>" +
        "Saiba mais em <a href='https://www.furia.gg' target='_blank' rel='noopener'>furia.gg</a>."
    },
    {
      id: "loja",
      keywords: ["loja", "comprar", "compra", "produto", "produtos", "roupa", "roupas", "camisa", "camiseta", "blusa", "calca", "jersey", "manto", "uniforme", "boné", "bone", "vestir", "merch", "preco", "valor"],
      response:
        "🛒 <strong>Loja oficial da FURIA</strong><br><br>" +
        "Vista o manto do melhor jeito! Camisas oficiais, coleções e acessórios você encontra na loja oficial:<br>" +
        "➡️ <a href='https://www.furia.gg' target='_blank' rel='noopener'>furia.gg</a><br><br>" +
        "Dica: fique de olho nos lançamentos das jerseys de jogo e nas coleções em parceria. 🔥"
    },
    {
      id: "assistir",
      keywords: ["assistir", "transmissao", "transmissão", "onde ver", "onde assistir", "twitch", "youtube", "stream", "live", "canal", "passa onde", "ver o jogo"],
      response:
        "📺 <strong>Onde assistir a FURIA</strong><br><br>" +
        "• YouTube → <a href='https://www.youtube.com/@FURIAggCS' target='_blank' rel='noopener'>FURIA CS</a><br>" +
        "• Twitch → <a href='https://www.twitch.tv/furiatv' target='_blank' rel='noopener'>twitch.tv/furiatv</a><br><br>" +
        "As partidas oficiais também passam nos canais dos campeonatos (ESL, BLAST, PGL). Confira a agenda em <a href='https://draft5.gg/equipe/330-FURIA/proximas-partidas' target='_blank' rel='noopener'>draft5.gg</a>. 🐾"
    },
    {
      id: "redes",
      keywords: ["rede", "redes", "social", "sociais", "instagram", "insta", "twitter", "x ", "tiktok", "facebook", "seguir", "perfil"],
      response:
        "🌐 <strong>Redes sociais da FURIA</strong><br><br>" +
        "• Instagram → <a href='https://www.instagram.com/furiagg' target='_blank' rel='noopener'>@furiagg</a><br>" +
        "• X (Twitter) → <a href='https://x.com/FURIA' target='_blank' rel='noopener'>@FURIA</a><br>" +
        "• TikTok → <a href='https://www.tiktok.com/@furia' target='_blank' rel='noopener'>@furia</a><br>" +
        "• Site oficial → <a href='https://www.furia.gg' target='_blank' rel='noopener'>furia.gg</a><br><br>" +
        "Segue a gente e #VAIFURIA! 🖤"
    },
    {
      id: "contato",
      keywords: ["whatsapp", "whats", "contato", "falar", "atendimento", "sugestao", "sugestão", "duvida", "dúvida", "suporte", "ajuda humana", "telefone"],
      response:
        "💬 <strong>Fale conosco</strong><br><br>" +
        "Tem dúvidas, sugestões ou quer trocar uma ideia? Chama no WhatsApp:<br>" +
        "➡️ <a href='https://wa.me/5511993404466' target='_blank' rel='noopener'>Abrir conversa no WhatsApp</a><br><br>" +
        "O CHAT FURIA agradece o contato! 🐾"
    },
    {
      id: "ajuda",
      keywords: ["ajuda", "help", "menu", "opcoes", "opções", "comandos", "o que voce faz", "o que vc faz", "como funciona", "pode fazer"],
      response:
        "🤖 <strong>Como posso te ajudar</strong><br><br>" +
        "Pergunte sobre qualquer um destes temas:<br>" +
        "• <em>Partidas</em> — agenda, resultados e placares<br>" +
        "• <em>Line-up</em> — jogadores e elenco atual<br>" +
        "• <em>Sobre</em> — história e títulos da FURIA<br>" +
        "• <em>Loja</em> — produtos e camisas oficiais<br>" +
        "• <em>Assistir</em> — onde ver os jogos<br>" +
        "• <em>Redes sociais</em> — Instagram, X, TikTok<br>" +
        "• <em>Contato</em> — falar pelo WhatsApp<br><br>" +
        "É só digitar! 🔥"
    },
    {
      id: "agradecimento",
      keywords: ["obrigado", "obrigada", "valeu", "vlw", "agradeco", "agradeço", "thanks", "obg", "show", "top"],
      response: "Disponível sempre, FURIOSO! 🐾 Se precisar de mais alguma coisa é só chamar. #VAIFURIA 🖤"
    },
    {
      id: "despedida",
      keywords: ["tchau", "ate mais", "até mais", "adeus", "falou", "flw", "bye", "ate logo", "até logo", "encerrar"],
      response: "Valeu pela visita! Volte sempre e bora torcer juntos. #DIADEFURIA 🔥🐾"
    }
  ];

  var fallback =
    "🤔 Hmm, não entendi muito bem. Pode reformular?<br><br>" +
    "Tente usar palavras-chave como <em>partidas</em>, <em>line-up</em>, <em>loja</em>, <em>assistir</em>, <em>redes sociais</em> ou <em>contato</em>. " +
    "Se preferir, digite <em>ajuda</em> para ver tudo que eu sei fazer. 🐾";

  /** Sugestões de respostas rápidas exibidas na interface. */
  var quickReplies = [
    { label: "📅 Próximas partidas", text: "Quais as próximas partidas?" },
    { label: "📊 Últimos resultados", text: "Quais os últimos resultados?" },
    { label: "👥 Line-up", text: "Qual o line-up atual?" },
    { label: "🏆 Sobre a FURIA", text: "Me fale sobre a FURIA" },
    { label: "🛒 Loja", text: "Onde comprar produtos?" },
    { label: "📺 Onde assistir", text: "Onde assistir os jogos?" }
  ];

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Verifica se uma palavra-chave aparece no texto.
   * Palavras simples casam por limite de palavra (evita "oi" casar com "coisa");
   * frases com espaço casam como substring.
   */
  function keywordMatches(text, keyword) {
    var kw = normalize(keyword);
    if (!kw) return false;
    if (kw.indexOf(" ") !== -1) {
      return text.indexOf(kw) !== -1;
    }
    var re = new RegExp("(^|[^a-z0-9])" + escapeRegExp(kw) + "([^a-z0-9]|$)");
    return re.test(text);
  }

  /**
   * Retorna a resposta do bot para uma mensagem.
   * @param {string} message
   * @returns {{ id: string, response: string, matched: boolean }}
   */
  function getResponse(message) {
    var text = normalize(message);

    if (!text) {
      return { id: "vazio", response: fallback, matched: false };
    }

    var best = null;
    var bestScore = 0;

    for (var i = 0; i < intents.length; i++) {
      var intent = intents[i];
      var score = 0;
      for (var j = 0; j < intent.keywords.length; j++) {
        if (keywordMatches(text, intent.keywords[j])) score++;
      }
      // Mantém o primeiro intent com a maior pontuação (ordem como desempate).
      if (score > bestScore) {
        bestScore = score;
        best = intent;
      }
    }

    if (best) {
      return { id: best.id, response: best.response, matched: true };
    }

    return { id: "fallback", response: fallback, matched: false };
  }

  return {
    getResponse: getResponse,
    normalize: normalize,
    intents: intents,
    quickReplies: quickReplies,
    fallback: fallback
  };
});
