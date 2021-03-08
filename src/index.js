

const div = document.querySelector('div#button-div')
const url = 'http://localhost:3000'
const login = document.querySelector('form#login-form')
const signup = document.querySelector('form#signup-form')
const task = document.querySelector('form#task-form')


task.style.display = 'none'

login.addEventListener('submit', event => {
    event.preventDefault()

    fetch(`${url}/users/login`, {
        method: 'POST',
        headers: {'Content-Type' : 'application/json',
                        'Accept': 'application/json'},
        body: JSON.stringify({name: event.target.name.value}) 
    })
        .then(r => r.json())
        .then(user => {
            login.dataset.id = user.id
            task.style.display = 'block'
            console.log(user)})
        .catch( error => console.log(error))

})

signup.addEventListener('submit', event => {
    event.preventDefault()

    fetch(`${url}/users`, {
        method: 'POST',
        headers: {'Content-Type' : 'application/json',
                        'Accept': 'application/json'},
        body: JSON.stringify({name: event.target.name.value}) 
    })
        .then(r => r.json())
        .then(user => {
            console.log(user)
        })
        .catch( error => console.log(error))

})

task.addEventListener('submit', event => {
    event.preventDefault()

    fetch(`${url}/tasks`, {
        method: 'POST',
        headers: {'Content-Type' : 'application/json',
                        'Accept': 'application/json'},
        body: JSON.stringify({
                name: event.target.name.value,
                user_id: login.dataset.id}) 
    })
        .then(r => r.json())
        .then(task => {
            console.log(task)
        })
        .catch( error => console.log(error))
})




div.addEventListener('click', event => {
    // event.preventDefault()

    if (event.target.matches('button#start-session')) {
        fetch(`${url}/study_sessions`, {
            method: 'POST',
            headers: {'Content-Type' : 'application/json',
                        'Accept': 'application/json'},
            body: JSON.stringify({user_id: login.dataset.id}) 
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

