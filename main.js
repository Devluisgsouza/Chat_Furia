const apiKey = "sk-proj-sk-proj-YH9v0Z3zkhzHd_x69ze-8ehifE8Lvcn6wTvv9wx_ZIIlbAzTZAc-LEw_p0IXaubLDaIHOZ8kBmT3BlbkFJlOl1PKwFSUydrIDESRY8z_QnFH3SBk4j1f-w0HYehKT9e53aiSFy9hz7P4gszn6XsfvbdTVJIA-EP5Y-iCUWGHrKfUWyEUurcw4e2EnxMPUqlpBIT3BlbkFJD1WfVGeX0nWEFF6yVXQWw483Q0JVD6p_9-XZn6YL1M_FkapzXxlyMnpI0jJceoYIpdGtYHztcA"

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

    fetch("https://api.openai.com/v1/completions"),{
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: message.value,
            max_tokens: 2048,
            temperature: 0.5,
        })
    }
}
