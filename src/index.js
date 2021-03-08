

const div = document.querySelector('div#button-div')
const url = 'http://localhost:3000'



div.addEventListener('click', event => {
    // event.preventDefault()

    if (event.target.matches('button#start-session')) {
        fetch(`${url}/study_sessions`, {
            method: 'POST',
            headers: {'Content-Type' : 'application/json',
                        'Accept': 'application/json'},
            body: JSON.stringify({user_id: 1}) 
        })
        .then(r => r.json())
        .then( studySession => {
            console.log(studySession)
            div.dataset.id = studySession.id})
    }

    if (event.target.matches('button#stop-session')) {
        fetch(`${url}/study_sessions/${event.target.parentElement.dataset.id}`, {
            method: 'PATCH',
            headers: {'Content-Type' : 'application/json',
                        'Accept': 'application/json'},
            body: JSON.stringify({}) 
        })
        .then(r => r.json())
        .then( studySession => {
            console.log(studySession)
            div.dataset.id = null})
    }

})

