const furia = 'Para isso voce pode acessar o site oficial da Furia! Lá voce encontra os melhores produtos do melhor time do Mundo! Segue o Link do site -> https://www.furia.gg'
const whats = 'Para tirar dúvidas, conversar conosco, ou até fornecer sugestões, nos chame no Whats! -> https://wa.me/5511993404466'
const proxPartidas = 'Para saber sobre as próximas partidas da FURIA, sobre o time, a equipe, entre outras informações, entre no link a seguir -> https://draft5.gg/equipe/330-FURIA/proximas-partidas'
const ola = 'Olá! Sou o CHAT FURIA, em que posso te ajudar?'


function sendMessage() {
    var messageInput = document.getElementById('message-input'); 
    var message = messageInput.value; // armazena o que foi digitado pelo usuário

    if (!message) {
        messageInput.style.border = '1px solid red'; // Apresenta borda vermelha na caixa de texto se enviar sem valor
        return;
    }

    messageInput.style.border = 'none';

    var status = document.getElementById('status');
    var btnSubmit = document.getElementById('btn-submit');
    

    // Apresenta o status quando a mensagem é enviada e desabilita os campos de interação

    status.style.display = 'block'  
    status.innerHTML = 'Loading...';
    btnSubmit.disabled = true;
    btnSubmit.style.cursor = 'not-allowed';
    messageInput.disabled = true;  

    setTimeout(() => {
        var response = chatResp(message); // resposta com base na mensagem
        showHitoric(message, response || "Poderia esplicar melhor o que você precisa? Se possível use palavras chaves, como (jogos, roupas, equipe, etc...) O CHAT FURIA agradece!");

        
        // Limpar status e reabilitar campos

        status.style.display = 'none'
        btnSubmit.disabled = false;
        btnSubmit.style.cursor = 'pointer';
        messageInput.disabled = false;
        messageInput.value = '';
    }, 1000); // espera 1 segundo
}

// Envia a mensagem com a tecla "Enter"

document.getElementById("message-input").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});


// Retorna a resposta com base em palavras chaves digitadas pelo usuário

function chatResp(message) {
    const olawords = ['ola', 'oi', 'hi', 'bom dia', 'boa tarde', 'boa noite', 'hello', 'eai']
    const lojaKeywords = ['loja', 'comprar', 'roupas', 'camisa', 'camiseta', 'calça', 'blusa', 'roupa', 'cammiseta'];
    const whatsKeywords = ['whatsapp', 'contato', 'falar', 'mensagem', 'conversar','atendimento'];
    const partidasKeywords = ['partida','partidas', 'jogo', 'jogos', 'horário', 'campeonato', 'jogador', 'equipe', 'time', 'camp'];

    message = message.toLowerCase();

    for (let word of lojaKeywords) {
        if (message.includes(word)) return furia;
    }

    for (let word of whatsKeywords) {
        if (message.includes(word)) return whats;
    }

    for (let word of partidasKeywords) {
        if (message.includes(word)) return proxPartidas;
    }

    for (let word of olawords) {
        if (message.includes(word)) return ola;
    }

    return null;
}


// Mostra as mensagens enviadas pelo usuário e as respostas do chat

function showHitoric(message, response) {
    var historic = document.getElementById('historic');

    // Minha mensagem
    var boxMyMessage = document.createElement('div');
    boxMyMessage.className = 'box-my-message';

    var myMessage = document.createElement('p');
    myMessage.className = 'my-message';
    myMessage.innerHTML = message;

    boxMyMessage.appendChild(myMessage);
    historic.appendChild(boxMyMessage);

    // Resposta do chat
    var boxChatMessage = document.createElement('div');
    boxChatMessage.className = 'box-chat-message';

    var chatMessage = document.createElement('p');
    chatMessage.className = 'chat-message';
    chatMessage.innerHTML = response;

    boxChatMessage.appendChild(chatMessage);
    historic.appendChild(boxChatMessage);

    historic.scrollTop = historic.scrollHeight
}





