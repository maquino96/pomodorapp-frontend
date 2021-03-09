const dbUrl = 'http://localhost:3000'
const adviceUrl = 'https://api.adviceslip.com/advice'

const div = document.querySelector('div#button-div')
const body = document.querySelector('body')

const loginForm = document.querySelector('form#login-form')
const signupForm = document.querySelector('form#signup-form')
const taskForm = document.querySelector('form#task-form')
const taskList = document.querySelector('ul.task-list')
const sessionList = document.querySelector('ul.session-list')
const adviceDiv = document.querySelector('div#advice')


document.addEventListener("DOMContentLoaded", event => {
    taskForm.style.display = 'none'
    formListeners()
})

// Functions
function getAdvice() {
    fetch(adviceUrl)
        .then(r => r.json())
        .then(adviceSlip => adviceDiv.textContent = adviceSlip.slip.advice)
}

//Fetches tasks to populate user's checklst
function getTasks(){
    taskList.innerHTML = ''

    fetch(`${dbUrl}/users/${loginForm.dataset.id}/tasks`)
        .then(r => r.json())
        .then( tasks => {
            tasks.forEach( task => {
                const li = document.createElement('li')
                li.textContent = task.name
                taskList.append(li)
            })

        })        
}

//Get tasks associated with each session
const getSessionTasks = (session) => {
    const ul = document.createElement('ul')
    fetch(`${dbUrl}/study_sessions/${session.id}/tasks`)
        .then( r => r.json())
        .then( tasks => {
            tasks.forEach( task => {
                const li = document.createElement('li')
                li.textContent = task.name
                ul.append(li)
            })
        })
    return ul
}

//Fetches all of the user's previous study sessions
function getSessions(){
    sessionList.innerHTML = ''

    fetch(`${dbUrl}/users/${loginForm.dataset.id}/sessions`)
        .then(r => r.json())
        .then( sessions => {
            sessions.forEach(session => {
                const li = document.createElement('li')
                li.textContent = session.id
                sessionList.append(li)
                sessionList.append(getSessionTasks(session))
                // fetch(`${dbUrl}/study_sessions/${session.id}/tasks`)
                //     .then( r => r.json())
                //     .then( tasks => {
                //         tasks.forEach( task => {
                //             const innerLi = document.createElement('li')
                //             innerLi.textContent = task.name
                //             li.append(innerLi)
                //         })
                //     })
        })
    })
}

// Event Listeners

//Listens to "login" form, then pulls user's tasks/sessions
const formListeners = () => {

    body.addEventListener('submit', event => {
        event.preventDefault()

        //Listen for login, then display user's lists
        if (event.target.matches("form#login-form")){
            // event.preventDefault()

            fetch(`${dbUrl}/users/login`, {
                method: 'POST',
                headers: {'Content-Type' : 'application/json',
                                'Accept': 'application/json'},
                body: JSON.stringify({name: event.target.name.value}) 
            })
                .then(r => r.json())
                .then(user => {
                    loginForm.dataset.id = user.id
                    taskForm.style.display = 'block'
                    getTasks()
                    getSessions()
                    getAdvice()
                    console.log(user)})
                .catch( error => console.log(error))
            
            event.target.reset()
        }

        //Listen for signup submissions
        if (event.target.matches("form#signup-form")){
            // event.preventDefault()

            fetch(`${dbUrl}/users`, {
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
            
            event.target.reset()
        }

        //Add listener for new task form, reload tasks on addition
        if (event.target.matches("form#task-form")){
            // event.preventDefault()
        
            fetch(`${dbUrl}/tasks`, {
                method: 'POST',
                headers: {'Content-Type' : 'application/json',
                                'Accept': 'application/json'},
                body: JSON.stringify({
                        name: event.target.name.value,
                        user_id: loginForm.dataset.id}) 
            })
                .then(r => r.json())
                .then(task => {
                    getTasks()
                    console.log(task)
                })
                .catch( error => console.log(error))
            
            event.target.reset()
        }
    })
}

//Listens for study session start/stop
div.addEventListener('click', event => {

    if (event.target.matches('button#start-session')) {
        fetch(`${dbUrl}/study_sessions`, {
            method: 'POST',
            headers: {'Content-Type' : 'application/json',
                        'Accept': 'application/json'},
            body: JSON.stringify({user_id: loginForm.dataset.id}) 
        })
        .then(r => r.json())
        .then( studySession => {
            console.log(studySession)
            div.dataset.id = studySession.id})
    }

    if (event.target.matches('button#stop-session')) {
        fetch(`${dbUrl}/study_sessions/${event.target.parentElement.dataset.id}`, {
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

