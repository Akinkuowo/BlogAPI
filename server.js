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

app.post('/login', (req,res) => {
    db.select('email', 'password').from('users')
    .then('where', '=', req.body.email)
    .then(response => {
		const isValid = bcrypt.compareSync(password, response[0].hash);
		if(isValid){
			return db.select('*').from('users')
			.where('email', '=', email)
			.then(user => {
				res.json(user[0])
			})
			.catch(err => res.status(400).json('unable to get user'))
		}else{
				res.status(400).json('username and password is incorrect')
		}
	}).catch(err => res.status(400).json('username and password is incorrect'))
})

app.post('/signup', (req, res) => { 
    const { email, name, password } = req.body;
    if(!name || !email || !password){
		return res.status(400).json('Bad form submittion request')
	}
    const hash = bcrypt.hashSync(password);
    db('users')
    .returning('*')
    .insert({
        name: name,
        email: email,
        password: hash,
        joined: new Date()
    }).then(response => {
        res.json(response)
    }).catch(error => res.status(400).json({
        email: ['email already taken']
    })
    
    )
    
})

app.get('/', (req, res) => {
    res.json('connected to');
})

// app.get('/', (req, res) => { res.json(db.users) })
app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) })
// app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })
app.get('/profile/:id', (req, res) => {profile.handleProfile(req, res, db) })



app.listen(3100, ()=> {
	console.log(`app is running on port 3100`)
}); 

