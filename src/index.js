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
const completedDiv = document.querySelector('div#completedUlDiv')

const compartment = document.querySelector('div#compartment')
const welcomeDiv = document.querySelector('div#welcome-div')
const errorP = document.querySelector("p#error-p")
const spotifyDiv = document.querySelector("div#spotify-div")
const startButton = document.querySelector("button#start-session")
const stopButton = document.querySelector("button#stop-session")
const timerButton = document.querySelector("button#timer-settings")

const userInfo = document.querySelector('div#user-info')
const timerForm = document.querySelector('form#timer-form')

const sessionP = document.querySelector('p#sessionMsgs')

//Initialize listeners after page loads
document.addEventListener("DOMContentLoaded", event => {
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

//Show/hide the session start/stop buttons
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

    //Get all of user's checklist tasks, add complete/delete buttons for each
    fetch(`${dbUrl}/users/${loginForm.dataset.id}/tasks`)
        .then(r => r.json())
        .then( tasks => {
            tasks.forEach( task => {
                const li = document.createElement('li')
                li.dataset.id = task.id
                li.textContent = task.name
                const completeButton = document.createElement('button')
                completeButton.classList.add("completeButton")
                completeButton.textContent = "✅"
                const deleteButton = document.createElement('button')
                deleteButton.classList.add("deleteTaskButton")
                deleteButton.textContent = "❌"
                li.prepend(completeButton)
                li.append(deleteButton)
                taskList.append(li)
            })

        })        
}

//Get tasks associated with each session
const getSessionTasks = (sessionId) => {
    completedDiv.innerHTML = ''
    const ul = document.createElement('ul')
    fetch(`${dbUrl}/study_sessions/${sessionId}/tasks`)
        .then( r => r.json())
        .then( tasks => {
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
            let sessCount = 0 
            let sum = 0

            if (sessions.length > 0 ){
                sessCount = sessions.length 
                
                const sumFunc = (acc,cv) => acc+cv
                sum = sessions.map( session => session.time_spent).reduce(sumFunc) 
            }

            userInfo.querySelector('p#time').innerText = `Completed Sessions: ${sessCount}, Total time: ${sum} `
              
            sessions.forEach(session => {

                date = new Date(Date.parse(session.created_at)).toLocaleDateString()

                const li = document.createElement('li')
                li.textContent = `Created On: ${date} Session Time: ${session.time_spent}`
                li.dataset.id = session.id
                const deleteButton = document.createElement('button')
                deleteButton.classList.add("deleteSessionButton")
                deleteButton.textContent = "❌"
                li.append(deleteButton)
                sessionList.append(li)
                li.append(getSessionTasks(session.id))
        })
    })
}

const updateTimerForm = (user) => {
    //Set timer form fields to user's current timings
    timerForm.querySelector("input#workTimer").value = user.timer_interval
    timerForm.querySelector("input#breakTimer").value = user.timer_break
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
                    if (user) {
                        //Set ID of logged in user
                        loginForm.dataset.id = user.id
                        //Hide "login" page and show Pomodoro dashboard
                        welcomeDiv.style.display = 'none'
                        compartment.style.display = 'inline-grid'

                        //Show spotify playlist
                        spotifyDiv.innerHTML = `<iframe src="${user.playlist}" width="300" height="100" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`

                        //Show username
                        userInfo.querySelector('h4#username').innerText = user.name

                        updateTimerForm(user);

                        //Fetch user's tasks, sessions, and fetch advice quote
                        getTasks()
                        getSessions()
                        getAdvice()
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

        //Handle form input for editing timers
        if (event.target.matches('form#timer-form')) {
            const id = loginForm.dataset.id
            const timer_interval = event.target.workTimer.value
            const timer_break = event.target.breakTimer.value
        
            fetch(`${dbUrl}/users/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type':'application/json',
                    Accept: 'application/json'
                }, 
                body: JSON.stringify({timer_interval, timer_break})
            })
                .then(r => r.json())
                .then(user => {
                    timerForm.classList.toggle('hidden')
                    updateTimerForm(user)
                    sessionP.textContent = "Timers successfully updated."
                })
        
        }
    })
}

//Listens for study session start/stop
sessionDiv.addEventListener('click', event => {
    
    //Listen for clicks on timer settings button, show timers
    if (event.target.matches('button#timer-settings')){
        if (sessionDiv.dataset.id === "null") {
            timerForm.classList.toggle('hidden')
        } else {
            sessionP.textContent = "You cannot edit your timers while a session is active."
        }
    }

    //Start study session, set sessionId
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
            sessionP.textContent = "Study session started!"
            sessionDiv.dataset.id = studySession.id

            // Timer start mechanics
            clock = initClock()
            sessionDiv.dataset.timer = clock
            // console.log(clock)
        })
    }

    //Stop study session, update study sessions list, clear completed tasks for session
    if (event.target.matches('button#stop-session')) {
        fetch(`${dbUrl}/study_sessions/${event.target.parentElement.dataset.id}`, {
            method: 'PATCH',
            headers: {'Content-Type' : 'application/json',
                        'Accept': 'application/json'},
            body: JSON.stringify({}) 
        })
        .then(r => r.json())
        .then( studySession => {
            sessionP.textContent = "Study session ended!"
            startStop()
            console.log(studySession)
            getSessions()
            sessionDiv.dataset.id = null
            completedDiv.innerHTML=''


            // Timer stop mechanics
            
            clearInterval(clock)
            h,m,s = 0
            document.querySelector('div.timer').innerText = '00:00:00'

        })
    }

})

const clickListeners = () => {
    body.addEventListener('click', event => {
        
        //Show registration fields on click
        if(event.target.matches('button#register-button')){
            toggleRegistration()
        }

        //Complete task on click - create studytask, refresh task list
        if(event.target.matches('button.completeButton')){
            const task_id = event.target.parentElement.dataset.id
            const study_session_id = sessionDiv.dataset.id
            if (study_session_id === "null"){
                alert("You must start a study session to complete a task!")
            } else {
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
                        completedDiv.append(getSessionTasks(study_session_id))
                    })
                    .catch(error => console.log(error))
            }
        }

        //Delete TASK button action
        if(event.target.matches('button.deleteTaskButton')){
            const task_id = event.target.parentElement.dataset.id
            fetch(`${dbUrl}/tasks/${task_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            })
                .then(() => getTasks())
                .catch(error => console.log(error))
        }

        //Delete study session
        if (event.target.matches('button.deleteSessionButton')){
            const session_id = event.target.parentElement.dataset.id
            console.log(session_id)
            fetch(`${dbUrl}/study_sessions/${session_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            })
                .then(() => getSessions())
                .catch(error => console.log(error))
        }
    })
}



