

const div = document.querySelector('div#button-div')
const url = 'http://localhost:3000'
const login = document.querySelector('form#login-form')
const signup = document.querySelector('form#signup-form')
const taskForm = document.querySelector('form#task-form')
const taskList = document.querySelector('ul.task-list')
const sessionList = document.querySelector('ul.session-list')


taskForm.style.display = 'none'


// Functions

function getTasks(){
    taskList.innerHTML = ''

    fetch(`${url}/users/${login.dataset.id}/tasks`)
        .then(r => r.json())
        .then( tasks => {
            tasks.forEach( task => {
                const li = document.createElement('li')
                li.textContent = task.name
                taskList.append(li)
            })

        })        
}

function getSessions(){
    sessionList.innerHTML = ''

    fetch(`${url}/users/${login.dataset.id}/sessions`)
        .then(r => r.json())
        .then( sessions => {
            sessions.forEach( session => {
                const li = document.createElement('li')
                li.textContent = session.id
                sessionList.append(li)

                fetch(`${url}/study_sessions/${session.id}/tasks`)
                    .then( r => r.json())
                    .then( tasks => {
                        tasks.forEach( task => {
                        const innerLi = document.createElement('li')
                        innerLi.textContent = task.name
                        li.append(innerLi)
                        })
            })
        })
    })
}

// Event Listeners

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
            taskForm.style.display = 'block'
            getTasks()
            getSessions()
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

taskForm.addEventListener('submit', event => {
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
            getTasks()
            console.log(task)
        })
        .catch( error => console.log(error))
})




div.addEventListener('click', event => {

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

