const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

// const signin = require('./controllers/signin');
// const register = require('./controllers/register');
// const profile = require('./controllers/profile');
// const image = require('./controllers/image');

const db = knex({
	client: 'pg',
	connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true,
	}
});


const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

app.get('/', (req, res) => {
     db.select('*').from('users')
        .then(user => {
            res.json(user)
     })
})

app.post('/login', (req,res) => {
    const {  email, password } 	= req.body;
    if( !email || !password){
		return res.status(400).json({
            invalid:   'Bad form submittion request'
        })
    }
    db.select('email', 'password').from('users')
	.where('email', '=', email)
	.then(response => {
        const isValid = bcrypt.compareSync(password, response[0].password);   
            if(isValid){
                return db.select('*').from('users')
                .where('email', '=', email)
                .then(user => {
                    res.json(user[0])
                }).catch(err => res.status(400).json({
                    userNotFound:  ['unable to get user']
                 })
              )
            }else{
				res.status(400).json({
                    incorrectPassword:    ['Your password is incorrect']
                })
		    }  
    }).catch(err => res.status(404)
        .json({
            Invalid: ['Email does not exist']
        })
    )


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
        email: ['email already taken!']
    })
    
    )
    
})

app.post('/add/categories', (req, res) => {
    const { Categories } = req.body;
    if(!Categories ){
		return res.status(400).json('Bad form submittion request')
	}
    db('categories')
    .returning('*')
    .insert({
        categories: Categories,
    }).then(response => {
        res.json(response)
    }).catch(error => res.status(400).json({
        email: ['Category already Exist!']
    })
    
    )
    
})


app.get('/categories', (req, res) => {
    db.select('*').from('categories')
        .then(category => {
            res.json(category)
     })
})


app.post('/upload', (req, res) => {
    
    if(req.files === null){
        return res.status(400).json({msg: 'No file was uploaded'})
    }else {
        const  image = req.files.image;
        image.mv(`https://plblog.netlify.app/uploads/${image.name}`, err => {
            if(err){
                console.log(err);
                return res.status(400).send(err)
            }else{
                res.status(200).json({
                    message: 'Image was Uploaded successfully'
                })
            }

        })
    }
})


app.post('/create/article', (req, res) => {
    const { title, category, Content, image, author } = req.body;
    
    const slug = title.replace(/\s/g, "_");

    if(!Content){
        console.log('file to load')
        return res.status(400).json({
            message: 'An Article Content is needed.'
        })
    }else if(!title){
        res.status(400).json({
            title: 'An Article title is needed.'
        })
    }else if(category === null){
        res.status(400).json({
            title: 'A category is needed.'
        })
    }else{    
        db('new_articles')
        .returning('*')
        .insert({
                title: title,
                category: category,
                content: Content,
                image_url: image,
                date: new Date(),
                slug: slug,
                author: author
        }).then(response => {
            res.status(200).json({
                Msg: 'Article was created successfully'
            })
        }).catch(error => res.status(400)
            .json({
                error: ['an error occur while trying to post your blog']
            })
        )
        
        }
})

app.get('/articles', (req, res) => {
    db.select('*').from('new_articles').orderBy('date', 'desc')
        .then(article => {
            res.json(article)
     })
})


app.get('/user/articles', (req, res) => {
    const { author } = req.body;
    // db.select('*').from('new_articles')
	// .where('author', '=', author)
	// .then(articles => {
    //     console.log(articles)
    //     res.json(articles)
    // })
})  

app.post('/comments', (req,res) => {
    const { blog_id } = req.body
    // console.log(blog_id)
    db.select('*').from('blog_comments').orderBy('date', 'desc')
        .where('blog_id', '=', blog_id)
        .then(comments => {
            res.json(comments)
        }).catch(err => res.status(400).json({
            CommentsNotFound:  ['unable to get comments']
        })
    )
})

app.post('/article/comment', (req, res) => {
    const { name, comment, blog_id } = req.body;
    if(!name){
        console.log(name)
        db('blog_comments')
        .returning('*')
        .insert({
                name: annoymus,
                comment: comment,
                blog_id: blog_id,
                date: new Date()
        }).then(response => {
            res.status(200).json({
                Msg: 'comment added successfully'
            })
        }).catch(error => res.status(400)
            .json({
                error: ['an error occur while trying to add your comment']
            })
        )
    }else{
        db('blog_comments')
        .returning('*')
        .insert({
                name: name,
                comment: comment,
                blog_id: blog_id,
                date: new Date()
        }).then(response => {
            res.status(200).json({
                Msg: 'comment added successfully'
            })
        }).catch(error => res.status(400)
            .json({
                error: ['an error occur while trying to add your comment']
            })
        )
    }
        

    
})  

app.get('/', (req, res) => { res.json(db.users) })
app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) })
// app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })
app.get('/profile/:id', (req, res) => {profile.handleProfile(req, res, db) })



app.listen(process.env.PORT || 4000, ()=> {
	console.log(`app is running onadd port ${process.env.PORT} `)
}); 

