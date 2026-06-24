/**
 * Dados ao vivo da FURIA (uso no servidor — Netlify Functions).
 *
 * Fonte: página pública da Draft5 (Next.js), de onde extraímos o JSON
 * embutido em <script id="__NEXT_DATA__">. Não requer chave de API.
 *
 * Exporta:
 *   - getUpcoming(): Promise<string|null>  -> texto HTML das próximas partidas
 *   - getResults():  Promise<string|null>  -> texto HTML dos últimos resultados
 *
 * Em caso de qualquer falha de rede/parse, retorna null para que o chamador
 * use a resposta estática (com os links oficiais) como fallback.
 */
"use strict";

const TEAM_ID = 330; // FURIA na Draft5
const SOURCE_URL = "https://draft5.gg/equipe/330-FURIA";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const FETCH_TIMEOUT = 8000; // ms
const BR_OFFSET = -3 * 3600; // BRT (UTC-3, sem horário de verão desde 2019)

// Cache em memória (reaproveitado entre invocações "quentes" da função).
let cache = { at: 0, data: null };

/* ---------- Coleta e parse ---------- */

async function fetchPageData() {
  if (cache.data && Date.now() - cache.at < CACHE_TTL) {
    return cache.data;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(SOURCE_URL, {
      signal: controller.signal,
      headers: {
        "User-Agent": "ChatFuriaFanBot/1.0 (+github.com/Devluisgsouza/Chat_Furia)",
        "Accept-Language": "pt-BR,pt;q=0.9"
      }
    });
    if (!res.ok) throw new Error("Draft5 status " + res.status);

    const html = await res.text();
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
    );
    if (!match) throw new Error("__NEXT_DATA__ não encontrado");

    const json = JSON.parse(match[1]);
    const pp = (json.props && json.props.pageProps) || {};
    const data = {
      upcoming: Array.isArray(pp.matches) ? pp.matches : [],
      results: Array.isArray(pp.results) ? pp.results : [],
      players: pp.data && Array.isArray(pp.data.playerData) ? pp.data.playerData : []
    };

    cache = { at: Date.now(), data };
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- Formatação ---------- */

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/** Converte um código de país ISO de 2 letras em emoji de bandeira. */
function flag(cc) {
  if (!/^[A-Za-z]{2}$/.test(cc || "")) return "🏳️";
  return cc
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

/** Formata um timestamp (segundos) para data/hora no horário de Brasília. */
function formatBR(tsSeconds) {
  const d = new Date((tsSeconds + BR_OFFSET) * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const dia = pad(d.getUTCDate());
  const mes = pad(d.getUTCMonth() + 1);
  const hora = pad(d.getUTCHours());
  const min = pad(d.getUTCMinutes());
  return `${dia}/${mes} às ${hora}:${min}`;
}

/** Identifica o adversário e o lado da FURIA em uma partida. */
function sides(m) {
  const furiaIsA = m.teamA && m.teamA.teamId === TEAM_ID;
  return {
    furia: furiaIsA ? m.teamA : m.teamB,
    rival: furiaIsA ? m.teamB : m.teamA,
    furiaScore: furiaIsA ? m.seriesScoreA : m.seriesScoreB,
    rivalScore: furiaIsA ? m.seriesScoreB : m.seriesScoreA
  };
}

function rivalName(m) {
  const s = sides(m);
  return (s.rival && s.rival.teamName) || "A definir";
}

function tournamentName(m) {
  return (m.tournament && m.tournament.tournamentName) || "Torneio a confirmar";
}

/* ---------- API pública ---------- */

async function getUpcoming() {
  const data = await fetchPageData();
  const list = (data.upcoming || []).slice(0, 5);

  if (!list.length) {
    return (
      "📅 <strong>Próximas partidas da FURIA</strong><br><br>" +
      "No momento não há jogos agendados na minha fonte (Draft5). 🐾<br>" +
      "Assim que a próxima partida for marcada ela aparece aqui. Acompanhe também em " +
      "<a href='https://draft5.gg/equipe/330-FURIA/proximas-partidas' target='_blank' rel='noopener'>draft5.gg/FURIA</a>."
    );
  }

  const lines = list.map(function (m) {
    const bo = m.bestOf ? ` (MD${m.bestOf})` : "";
    const quando = m.isTBA || !m.matchDate ? "data a definir" : formatBR(m.matchDate);
    return (
      `🆚 <strong>FURIA</strong> vs ${escapeHtml(rivalName(m))}${bo}<br>` +
      `🏆 ${escapeHtml(tournamentName(m))}<br>` +
      `🗓️ ${escapeHtml(quando)}`
    );
  });

  return (
    "📅 <strong>Próximas partidas da FURIA</strong> <em>(ao vivo)</em><br><br>" +
    lines.join("<br><br>") +
    "<br><br>Detalhes e transmissão em " +
    "<a href='https://draft5.gg/equipe/330-FURIA/proximas-partidas' target='_blank' rel='noopener'>draft5.gg/FURIA</a>. 🔥"
  );
}

async function getResults() {
  const data = await fetchPageData();
  const list = (data.results || []).filter((m) => m.isFinished).slice(0, 5);

  if (!list.length) return null;

  const lines = list.map(function (m) {
    const s = sides(m);
    const venceu = Number(s.furiaScore) > Number(s.rivalScore);
    const icon = venceu ? "✅" : "❌";
    const quando = m.matchDate ? ` <span style="opacity:.7">(${escapeHtml(formatBR(m.matchDate))})</span>` : "";
    return (
      `${icon} <strong>FURIA ${s.furiaScore} x ${s.rivalScore} ${escapeHtml(rivalName(m))}</strong>${quando}<br>` +
      `<span style="opacity:.8">${escapeHtml(tournamentName(m))}</span>`
    );
  });

  return (
    "📊 <strong>Últimos resultados da FURIA</strong> <em>(ao vivo)</em><br><br>" +
    lines.join("<br><br>") +
    "<br><br>Histórico completo em " +
    "<a href='https://draft5.gg/equipe/330-FURIA' target='_blank' rel='noopener'>draft5.gg/FURIA</a>. 🐾"
  );
}

async function getLineup() {
  const data = await fetchPageData();
  const players = data.players || [];
  if (!players.length) return null;

  // Considera apenas o vínculo atual (sem data de saída).
  const active = players
    .map(function (p) {
      const current = (p.playerHistory || []).find((h) => h.endDate === null);
      return current ? { p: p, status: current.status || "" } : null;
    })
    .filter(Boolean);

  if (!active.length) return null;

  const isStaff = (s) => /coach|t[ée]cnic/i.test(s);
  const isBench = (s) => /reserva|banco/i.test(s);

  const line = (item) =>
    `${flag(item.p.playerCountry)} <strong>${escapeHtml(item.p.playerNickname)}</strong>`;

  const starters = active.filter((i) => !isStaff(i.status) && !isBench(i.status));
  const bench = active.filter((i) => isBench(i.status));
  const staff = active.filter((i) => isStaff(i.status));

  const blocks = [];

  if (starters.length) {
    blocks.push("🎮 <strong>Titulares</strong><br>" + starters.map(line).join("<br>"));
  }
  if (bench.length) {
    blocks.push("🪑 <strong>Reservas</strong><br>" + bench.map(line).join("<br>"));
  }
  if (staff.length) {
    blocks.push(
      "🎯 <strong>Comissão técnica</strong><br>" +
        staff
          .map((i) => `${line(i)} <span style="opacity:.7">— ${escapeHtml(i.status)}</span>`)
          .join("<br>")
    );
  }

  return (
    "👥 <strong>Line-up atual da FURIA (CS2)</strong> <em>(ao vivo)</em><br><br>" +
    blocks.join("<br><br>") +
    "<br><br>Fonte e perfis em " +
    "<a href='https://draft5.gg/equipe/330-FURIA' target='_blank' rel='noopener'>draft5.gg/FURIA</a>. 🐾"
  );
}

module.exports = { getUpcoming, getResults, getLineup };
