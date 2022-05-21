
// Login

const loginAndRegisterForm = document.querySelector('#login-form')
const firstNameInput = document.querySelector('#first-name')
const lastNameInput = document.querySelector('#last-name')
const emailInput = document.querySelector('#email')
const passwordInput = document.querySelector('#password')
let userExists = false

loginAndRegisterForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    if (state == 'Login'){
        await fetch('/api/login', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailInput.value,
                password: passwordInput.value
            })
        })
    } else {
        await fetch('/api/users', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: firstNameInput.value,
                lastName: lastNameInput.value,
                email: emailInput.value,
                password: passwordInput.value
            })
        })
        await fetch('/api/login', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailInput.value,
                password: passwordInput.value
            })
        })
    }

    loginAndRegisterForm.reset()
    location.reload()
})

// check if logged in user

const loginSection = document.querySelector('.login-section')

const checkIfLoggedIn = async () => {
    const response = await fetch('/api/loggedin')
    const user = await response.json()

    if(user.user) {
        window.location.href = `user.html?user=${user.user._id}`
    }
}

checkIfLoggedIn()


// Register new user

const toggleLoginRegister = document.querySelector('.toggle-login-register')
const submitButton = document.querySelector('.submit-btn')
let state = 'Login'

toggleLoginRegister.addEventListener('click', () => {
    firstNameInput.classList.toggle('hidden')
    lastNameInput.classList.toggle('hidden')
    if (state == 'Login'){
        state = 'Register'
        submitButton.innerText = state
        firstNameInput.required = true
        lastNameInput.required = true
        toggleLoginRegister.innerText = 'Already a member? Log in here'
    } else {
        state = 'Login'
        submitButton.innerText = state
        firstNameInput.required = false
        lastNameInput.required = false
        toggleLoginRegister.innerText = 'Not a member? Register here'
    }
    console.log(state)
})