const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const signin = require('./controllers/signin');
const register = require('./controllers/register');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
	client: 'pg',
	connection: {
        host: 'localhost',
        user: 'postgres',
        password: '7386',
        database: 'PLBlogDB'
	}
});


const app = express();

app.use(bodyParser.json());
app.use(cors());


app.post('/signup', (req, res) => { 
    const { email, name, password } = req.body;
    db('users')
    .returning('*')
    .insert({
        name: name,
        email: email,
        joined: new Date()
    }).then(response => {
        res.json(response)
    })
    
})

app.get('/', (req, res) => {
    res.send(db('users'));
})

// app.get('/', (req, res) => { res.json(db.users) })
app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) })
// app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })
app.get('/profile/:id', (req, res) => {profile.handleProfile(req, res, db) })



app.listen(3100, ()=> {
	console.log(`app is running on port 3100`)
}); 

