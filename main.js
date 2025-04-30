const apiKey = "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"

function sendMessage(){
    var message = document.getElementById('message-input')
    if(!message.value)
    {
        message.style.border = '1px solid red'
        return
    }
    message.style.border = 'none'

    var status = document.getElementById('status')
    var btnSubmit = document.getElementById('btn-submit')

    status.innerHTML = 'Loading...'
    btnSubmit.disabled = true
    btnSubmit.style.cursor = 'not-allowed'
    message.disabled = true

    fetch("https://api.openai.com/v1/completions",{
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o",
            prompt: message.value,
            max_tokens: 200,
            temperature: 0.5
        })
    })
    .then((response) => response.json())
    .then((response) => {
        let r = response.choices[0]['text']
        showHitoric(message.value,r)
    })
    .catch((e) => {
        console.log('Error -> ',e)
    })
    .finally(() => {
        btnSubmit.disabled = false
        btnSubmit.style.cursor = 'pointer'
        message.disabled = false
    })
}


function showHitoric(message,response){
    var historic = document.getElementById('historic')

    // My messages
    var boxMyMessage = document.createElement('div')
    boxMyMessage.className = 'box-my-message'

    var myMessage = document.createElement('p')
    myMessage.className = 'my-message'
    myMessage.innerHTML = message

    boxMyMessage.appendChild(myMessage)
    historic.appendChild(boxMyMessage)


    // Response Messages
    var historic = document.getElementById('historic')

    // My messages
    var boxChatMessage = document.createElement('div')
    boxChatMessage.className = 'box-chat-message'

    var chatMessage = document.createElement('p')
    boxChatMessage.className = 'my-message'
    chatMessage.innerHTML = response

    boxChatMessage.appendChild(chatMessage)
    historic.appendChild(boxChatMessage)
}