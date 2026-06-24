/**
 * API serverless do CHAT FURIA (Netlify Function).
 *
 * Endpoint: POST /api/chat   (ver redirect em netlify.toml)
 * Body:     { "message": "qual o line-up?" }
 * Resposta: { "response": "...", "intent": "lineup", "matched": true }
 *
 * Reutiliza a mesma base de conhecimento do front-end (knowledge.js),
 * mantendo as respostas consistentes entre cliente e servidor.
 */
const knowledge = require("../../knowledge.js");
const live = require("../../liveData.js");

/**
 * Para intents de partidas/resultados, tenta enriquecer com dados ao vivo
 * (Draft5). Em caso de falha, mantém a resposta estática como fallback.
 */
async function withLiveData(result) {
  try {
    if (result.id === "partidas") {
      const text = await live.getUpcoming();
      if (text) return { response: text, intent: result.id, matched: true, live: true };
    } else if (result.id === "resultados") {
      const text = await live.getResults();
      if (text) return { response: text, intent: result.id, matched: true, live: true };
    } else if (result.id === "lineup") {
      const text = await live.getLineup();
      if (text) return { response: text, intent: result.id, matched: true, live: true };
    }
  } catch (err) {
    // silencioso: cai para a resposta estática abaixo
  }
  return { response: result.response, intent: result.id, matched: result.matched, live: false };
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8"
};

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS,
      body: JSON.stringify({ error: "Método não permitido. Use POST." })
    };
  }

  let message = "";
  try {
    const payload = JSON.parse(event.body || "{}");
    message = typeof payload.message === "string" ? payload.message : "";
  } catch (err) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: "JSON inválido no corpo da requisição." })
    };
  }

  const result = knowledge.getResponse(message);
  const payload = await withLiveData(result);

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify(payload)
  };
};
