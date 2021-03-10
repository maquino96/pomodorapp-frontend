

const dbUrl = 'http://localhost:3000'
const adviceUrl = 'https://api.adviceslip.com/advice'

const sessionDiv = document.querySelector('div#session-div')
const body = document.querySelector('body')

const loginForm = document.querySelector('form#login-form')
const registerForm = document.querySelector('form#register-form')
const taskForm = document.querySelector('form#task-form')
const taskList = document.querySelector('ul#task-list')
const sessionList = document.querySelector('ul#session-list')
const adviceDiv = document.querySelector('div#advice')
const completedDiv = document.querySelector('div#completed-tasks')

const container = document.querySelector('div#container')
const welcomeDiv = document.querySelector('div#welcome-div')
const errorP = document.querySelector("p#error-p")
const spotifyDiv = document.querySelector("div#spotify-div")
const startButton = document.querySelector("button#start-session")
const stopButton = document.querySelector("button#stop-session")

const userInfo = document.querySelector('div#user-info')

document.addEventListener("DOMContentLoaded", event => {
    container.style.display = 'none'
    formListeners()
    clickListeners()
})

// Functions

//Toggle hiding Registration form
const toggleRegistration = () => {
    registerForm.classList.toggle('hidden')
}

//Toggle hiding p element that shows login/registration errors
const toggleErrorP = () => {
    errorP.classList.toggle('hidden')
}

const startStop = () => {
    startButton.classList.toggle('hidden')
    stopButton.classList.toggle('hidden')
}

//Fetch advice from API
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
                li.dataset.id = task.id
                li.textContent = task.name
                const completeButton = document.createElement('button')
                completeButton.id = "completeButton"
                // completeButton.textContent = "✅"
                completeButton.textContent = "Complete"
                const deleteButton = document.createElement('button')
                deleteButton.id = "deleteButton"
                // deleteButton.textContent = "❌"
                deleteButton.textContent = "Delete"
                li.prepend(completeButton)
                li.append(deleteButton)
                taskList.append(li)
            })

        })        
}

//Get tasks associated with each session
const getSessionTasks = (sessionId) => {
    const ul = document.createElement('ul')
    fetch(`${dbUrl}/study_sessions/${sessionId}/tasks`)
        .then( r => r.json())
        .then( tasks => {
            console.log(tasks)
            tasks.forEach( task => {
                const li = document.createElement('li')
                li.textContent = task.name
                ul.append(li)
            })
        })
        .catch(error => console.log(error))
    return ul
}

//Fetches all of the user's previous study sessions
function getSessions(){
    sessionList.innerHTML = ''

    fetch(`${dbUrl}/users/${loginForm.dataset.id}/sessions`)
        .then(r => r.json())
        .then( sessions => {
            
            //user-info number of sessions & total time 
            const sumFunc = (acc,cv) => acc+cv
            const sum = sessions.map( session => session.time_spent).reduce(sumFunc) 
            userInfo.querySelector('p#time').innerText = `Completed Sessions: ${sessions.length}, Total time: ${sum}`

              
            sessions.forEach(session => {

                date = new Date(Date.parse(session.created_at)).toLocaleDateString()

                const li = document.createElement('li')
                li.textContent = `Created On: ${date} Session Time: ${session.time_spent}`
                sessionList.append(li)
                sessionList.append(getSessionTasks(session.id))
        })
    })
}


//******************** Event Listeners ********************//

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
                    console.log(user)
                    if (user) {
                        loginForm.dataset.id = user.id
                        welcomeDiv.style.display = 'none'
                        container.style.display = 'inline-grid'
                        spotifyDiv.innerHTML = `<iframe src="${user.playlist}" width="300" height="100" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`
                        userInfo.querySelector('h3#username').innerText = user.name
                        getTasks()
                        getSessions()
                        getAdvice()
                        console.log(user)
                    } else {
                        if(errorP.classList.contains('hidden')){
                            toggleErrorP()
                        }
                        errorP.textContent = "Invalid Username. Please try again, or sign up!"
                        event.target.reset()
                    }
                })
                .catch(error => console.log(error))
        }

        //Listen for signup submissions
        if (event.target.matches("form#register-form")){
            // event.preventDefault()
            
            fetch(`${dbUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({name: event.target.name.value}) 
            })
                .then(r => r.json())
                .then(user => {
                    if (errorP.classList.contains('hidden')){
                       toggleErrorP()
                    }
                    if (user) {
                        errorP.textContent = "Registration successful. You may now sign in!"
                    } else {
                        errorP.textContent = "Username must be unique. Try another one."
                    }
                })
                .catch(error => console.log(error))
            event.target.reset()
        }

        //Add listener for new task form, reload tasks on addition
        if (event.target.matches("form#task-form")){
            // event.preventDefault()
        
            fetch(`${dbUrl}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                        name: event.target.name.value,
                        user_id: loginForm.dataset.id
                }) 
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
sessionDiv.addEventListener('click', event => {
    
    if (event.target.matches('button#start-session')) {
        fetch(`${dbUrl}/study_sessions`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({user_id: loginForm.dataset.id}) 
        })
        .then(r => r.json())
        .then( studySession => {
            startStop()
            console.log(studySession)
            sessionDiv.dataset.id = studySession.id
        })
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
            startStop()
            console.log(studySession)
            getSessions()
            sessionDiv.dataset.id = null
            completedDiv.innerHTML=''
        })
    }

})

const clickListeners = () => {
    body.addEventListener('click', event => {
        const task_id = event.target.parentElement.dataset.id
        const study_session_id = sessionDiv.dataset.id

        if(event.target.matches('button#register-button')){
            toggleRegistration()
        }

        if(event.target.matches('button#completeButton')){
            fetch(`${dbUrl}/study_tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({task_id, study_session_id})
            })
                .then(() => {
                    getTasks()
                    completedDiv.innerHTML = ''
                    completedDiv.append(getSessionTasks(study_session_id))
                })
                .catch(error => console.log(error))
        }

        if(event.target.matches('button#deleteButton')){
            
        }
    })
}



