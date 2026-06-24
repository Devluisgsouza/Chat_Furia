/* ============================================================
   CHAT FURIA — lógica do front-end
   - Tenta responder via API serverless (/api/chat)
   - Faz fallback para a base de conhecimento local (knowledge.js)
   ============================================================ */
(function () {
  "use strict";

  var API_ENDPOINT = "/api/chat";
  var THINK_DELAY = 700; // ms — tempo do "digitando..."

  var els = {
    history: document.getElementById("historic"),
    form: document.getElementById("chat-form"),
    input: document.getElementById("message-input"),
    sendBtn: document.getElementById("btn-submit"),
    typing: document.getElementById("typing"),
    quickReplies: document.getElementById("quick-replies"),
    suggestionsToggle: document.getElementById("suggestions-toggle"),
    suggestionsLabel: document.getElementById("suggestions-toggle-label")
  };

  var apiAvailable = true; // vira false após a primeira falha de fetch

  /* ---------- Utilidades ---------- */

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function timeNow() {
    return new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function scrollToBottom() {
    els.history.scrollTop = els.history.scrollHeight;
  }

  /* ---------- Renderização de mensagens ---------- */

  /**
   * @param {string} content - texto (usuário) ou HTML confiável (bot)
   * @param {"user"|"bot"} sender
   * @param {boolean} isHtml - true quando o conteúdo é HTML do próprio bot
   */
  function addMessage(content, sender, isHtml) {
    var wrapper = document.createElement("div");
    wrapper.className = "message message--" + sender;

    var bubble = document.createElement("div");
    bubble.className = "message__bubble";
    if (isHtml) {
      bubble.innerHTML = content; // conteúdo do bot é confiável
    } else {
      bubble.textContent = content; // mensagem do usuário: sempre escapada
    }

    var time = document.createElement("span");
    time.className = "message__time";
    time.textContent = timeNow();

    wrapper.appendChild(bubble);
    wrapper.appendChild(time);
    els.history.appendChild(wrapper);
    scrollToBottom();
  }

  function showTyping(show) {
    els.typing.hidden = !show;
    if (show) scrollToBottom();
  }

  function setBusy(busy) {
    els.sendBtn.disabled = busy;
    els.input.disabled = busy;
    if (!busy) els.input.focus();
  }

  /* ---------- Obtenção da resposta ---------- */

  /** Resolve a resposta usando a API; cai para a base local em caso de erro. */
  function resolveResponse(message) {
    if (!apiAvailable) {
      return Promise.resolve(localResponse(message));
    }

    return fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("API status " + res.status);
        return res.json();
      })
      .then(function (data) {
        return data && data.response ? data.response : localResponse(message);
      })
      .catch(function () {
        // Sem backend (ex.: aberto via Live Server) — usa o motor local.
        apiAvailable = false;
        return localResponse(message);
      });
  }

  function localResponse(message) {
    if (window.FuriaKnowledge) {
      return window.FuriaKnowledge.getResponse(message).response;
    }
    return "Ops! Não consegui carregar minhas respostas. Tente recarregar a página. 🐾";
  }

  /* ---------- Fluxo de envio ---------- */

  function handleSend(rawMessage) {
    var message = (rawMessage || "").trim();

    if (!message) {
      els.input.classList.add("is-invalid");
      setTimeout(function () {
        els.input.classList.remove("is-invalid");
      }, 400);
      return;
    }

    addMessage(message, "user", false);
    els.input.value = "";
    setBusy(true);
    showTyping(true);

    var started = Date.now();
    resolveResponse(message).then(function (response) {
      // Garante um tempo mínimo de "digitando" para parecer natural.
      var wait = Math.max(0, THINK_DELAY - (Date.now() - started));
      setTimeout(function () {
        showTyping(false);
        addMessage(response, "bot", true);
        setBusy(false);
      }, wait);
    });
  }

  /* ---------- Respostas rápidas ---------- */

  function renderQuickReplies() {
    if (!window.FuriaKnowledge || !els.quickReplies) return;
    var replies = window.FuriaKnowledge.quickReplies || [];

    replies.forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quick-reply";
      btn.textContent = item.label;
      btn.addEventListener("click", function () {
        handleSend(item.text);
      });
      els.quickReplies.appendChild(btn);
    });
  }

  function setSuggestionsOpen(open) {
    els.quickReplies.hidden = !open;
    els.suggestionsToggle.setAttribute("aria-expanded", String(open));
    els.suggestionsLabel.textContent = open ? "Fechar sugestões" : "Abrir sugestões";
  }

  function setupSuggestionsToggle() {
    if (!els.suggestionsToggle) return;
    els.suggestionsToggle.addEventListener("click", function () {
      var isOpen = els.suggestionsToggle.getAttribute("aria-expanded") === "true";
      setSuggestionsOpen(!isOpen);
    });
  }

  /* ---------- Inicialização ---------- */

  function init() {
    renderQuickReplies();
    setupSuggestionsToggle();

    // Mensagem de boas-vindas.
    showTyping(true);
    setTimeout(function () {
      showTyping(false);
      addMessage(localResponse("ola"), "bot", true);
    }, 500);

    els.form.addEventListener("submit", function (event) {
      event.preventDefault();
      handleSend(els.input.value);
    });

    els.input.focus();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
