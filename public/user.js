// rendering user page if logged in

const params = new URLSearchParams(location.search)
const currentUserId = params.get('user')

const welcomeText = document.querySelector('.welcome-text')
const accountsList = document.querySelector('.accounts-list')

const currency = new Intl.NumberFormat('se-SE', {
    style: 'currency',
    currency: 'SEK'
})

const renderUserPage = async () => {

    const response = await fetch(`/api/users/${currentUserId}`)
    const user = await response.json()

    let {firstName, accounts} = user

    welcomeText.innerText = `Welcome ${firstName}!`

    accounts.forEach(account => {
        let {accountName, accountNumber, accountBalance} = account
        let newListItem = document.createElement('li')
        newListItem.innerHTML = `
        <p class="account-name">${accountName}</p>
        <p class="account-number">${accountNumber}</p>
        <p class="account-balance">${currency.format(accountBalance)}</p>
        <button data-number="${accountNumber}" data-balance="${accountBalance}" class="deposit-btn" onclick="toggleTransactionPopup(this)">Deposit</button>
        <button  data-number="${accountNumber}" data-balance="${accountBalance}" class="withdraw-btn" onclick="toggleTransactionPopup(this)">Withdraw</button>
        <button  data-number="${accountNumber}" data-balance="${accountBalance}" class="delete-btn" onclick="deleteAccount(this)">Delete</button>
        `
        accountsList.append(newListItem)
    });

}

renderUserPage()

// Logout

const logOutButton = document.querySelector('.logout-btn')

logOutButton.addEventListener('click', async (e) => {
    let confirmLogout = confirm('Are you sure you want to log out?')

    if (confirmLogout){
        const response = await fetch('http://localhost:3000/api/logout', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        window.location.href = '/'
    }
})


// add new account

const addNewAccountButton = document.querySelector('.add-new-account-btn')
const addNewAccountPopup = document.querySelector('.add-new-account-section')
const newAccountForm = document.querySelector('#new-account-form')
const newAccountName = document.querySelector('#new-account-name')

const togglePopup = () => {
    addNewAccountPopup.classList.toggle('hidden')
}

newAccountForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const response = await fetch(`http://localhost:3000/api/users/${currentUserId}/accounts`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            $push: {
                accounts: {
                    accountName: newAccountName.value,
                    accountBalance: 0
                }
            }
        })
    })

    location.reload()
})

// inserting and withdrawing money

const transactionPopup = document.querySelector('.transaction')
const transactionButton = document.querySelector('#transaction-btn')
const currentBalanceText = document.querySelector('.current-balance')
const transactionForm = document.querySelector('#transaction-form')
const transactionAmountInput = document.querySelector('#amount')
let transactionState
let currentAccount
let accountBalance

const toggleTransactionPopup = (e) => {
    currentAccount = e.dataset.number
    accountBalance = e.dataset.balance
    currentBalanceText.innerText = `Current balance: ${currency.format(accountBalance)}`
    if (e.classList.contains('deposit-btn')){
        transactionButton.innerText = 'Deposit'
        transactionState = 'Deposit'
    } else {
        transactionButton.innerText = 'Withdraw'
        transactionState = 'Withdraw'
    }
    transactionPopup.classList.toggle('hidden')

    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        let newAccountBalance

        if (transactionState == 'Deposit') {
            newAccountBalance = (parseInt(accountBalance) + parseInt(transactionAmountInput.value))
        } else {
            if ((parseInt(accountBalance) - parseInt(transactionAmountInput.value) >= 0)) {
                newAccountBalance = (parseInt(accountBalance) - parseInt(transactionAmountInput.value))
            } else {
                alert('You do not have enough funds for this transaction')
                newAccountBalance = accountBalance
            }
        }

        const response = await fetch(`http://localhost:3000/api/users/${currentUserId}/accounts/${currentAccount}`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accounts: {
                    accountBalance: newAccountBalance
                }
            })
        })
        location.reload()
    })
}

// Delete account

const deleteAccount = async (e) => {
    const currentAccount = e.dataset.number
    const currentBalance = parseInt(e.dataset.balance)

    if (currentBalance == 0){
        const response = await fetch(`http://localhost:3000/api/users/${currentUserId}/accounts`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                $pull: {
                    accounts: {
                        accountNumber: currentAccount
                    }
                }
            })
        })
    } else {
        alert('Please withdraw money from account before deleting')
    }
   
    location.reload()
}


