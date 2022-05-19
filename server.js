
import express from "express"
import session from "express-session"
import { MongoClient, ObjectId } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'

const port = 3000
const app = express()
const saltRounds = 10

const client = new MongoClient('mongodb://127.0.0.1:27017')
await client.connect()
const db =client.db('bank')
const usersCollection = db.collection('users')

// middlewares

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'This is very secret',
}))


// routes

// GET all users

app.get('/api/users', async (req, res) => {
    const users = await usersCollection.find().toArray()
    res.json(users)
})

// POST new user

app.post('/api/users', async (req, res) => {
    const hash = await bcrypt.hash(req.body.password, saltRounds)
    const newMember = await usersCollection.insertOne({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: hash,
        email: req.body.email,
        accounts: []
    })
    res.json(newMember)
})

// GET single user

app.get('/api/users/:id', async (req, res) => {
    const currentUser =  await usersCollection.findOne({
        _id: ObjectId(req.params.id)
    })
    res.json(currentUser)
})

// GET user accounts

app.get('/api/users/:id/accounts', async (req, res) => {
    const currentUser =  await usersCollection.findOne({
        _id: ObjectId(req.params.id)
    })
    res.json(currentUser.accounts)
})

// POST new account

app.post('/api/users/:id/accounts', async (req, res) => {
    const newAccount = await usersCollection.findOneAndUpdate({
        _id: ObjectId(req.params.id)
    }, {
        $push: {
            accounts: {
                accountNumber: uuidv4(),
                accountName: req.body.$push.accounts.accountName,
                accountBalance: req.body.$push.accounts.accountBalance,
            }
        }
    })
    res.json(newAccount)
})

// DELETE one user

app.delete('/api/users/:id', async (req, res) => {
    const response = await usersCollection.deleteOne({
        _id: ObjectId(req.params.id)
    })
    res.json(response)
})

// DELETE one account

app.put('/api/users/:id/accounts', async (req, res) => {
    const response = await usersCollection.findOneAndUpdate({
        _id: ObjectId(req.params.id)
    }, {
        $pull: {
            accounts: {
                accountNumber: req.body.$pull.accounts.accountNumber
            }
        }
    })
    res.json(response)
})

// LOGIN

app.post('/api/login', async (req, res) => {
    const user = await usersCollection.findOne({
        email: req.body.email,
        // password: req.body.password
    })
    const passMatches = await bcrypt.compare(req.body.password, user.password)

    if (user && passMatches) {
        req.session.user = user
        res.json({
            user: user.user
        })
    } else {
        res.status(401).send('Unauthorized')
    }
})

app.get('/api/loggedin', (req, res) => {
    if (req.session.user) {
        res.json({
            user: req.session.user
        })
    } else {
        res.status(401).json({
            error: 'Unauthorized'
        })
    }
})


// UPDATE Account balance

app.put('/api/users/:id/accounts/:number', async (req, res) => {
    const response = await usersCollection.updateOne({
        _id: ObjectId(req.params.id), 
        "accounts.accountNumber": req.params.number
    }, {
        $set: {
            "accounts.$.accountBalance": req.body.accounts.accountBalance
        }
    })

    res.json(response)
})

// logout

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({
            loggedin: false
        })
    })
})



app.listen(port, () => console.log(`Listening to ${port}`))