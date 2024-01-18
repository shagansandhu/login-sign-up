const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const app = express();

mongoose.connect('mongodb://localhost:27017/login', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));



// Set the views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Set the static files directory
app.use(express.static(path.join(__dirname, 'public')));

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});
const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/notes', async (req, res) => {
  try {
    const users = await User.find();
    res.render('notes', { users });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user._id;
      res.redirect('/home');
    } else {
      res.send('Invalid username or password');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/home', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      res.redirect('/');
    } else {
      res.render('home');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/update-password', async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.redirect('/');
        } else {
            const newPassword = req.body.newPassword;
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.findByIdAndUpdate(userId, { password: hashedPassword });
            res.send('Password updated successfully');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/delete-account', async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.redirect('/');
        } else {
            await User.findByIdAndDelete(userId);
            req.session.destroy();
            res.send('Account deleted successfully');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// sockets ==> sockets are used to enable real-time communication 
//between a client and a server. Traditional HTTP communication follows 
//a request-response model, where the client sends a request to the server, 
//and the server responds. 


//Sessions in web development are a way to store and persist user-specific information across multiple requests. 

//Cookies in web development are small pieces of data stored on the user's device by the web browser. 
//They are commonly used to store information about the user or their interactions with a website.

//routing ==>In web development, a route refers to a mechanism for defining how an application responds 
//to a specific HTTP request. It defines the association between a URL (Uniform Resource Locator) and 
//the code that should be executed to handle the request.

//middleware ==> In the context of web frameworks, middleware functions are executed in the order they are 
//added to the application, allowing developers to customize the behavior of the server and process incoming 
//requests before they reach the final route handler.

//schemas ==>refers to a structured representation of the organization and arrangement of data. Schemas define 
//the data model for a database or the structure of data within an application. 

//models ==>In web development, the term "models" typically refers to components that represent the data and 
//business logic of an application.

//In the Model-View-Controller (MVC) architectural pattern commonly used in web development It encapsulates 
//the data and behavior of the application, ensuring separation from the user interface (View) and user 
//input handling (Controller).

//jwt==>JSON Web Tokens (JWT) are a compact, URL-safe means of representing claims to be transferred between 
//two parties. JWTs are commonly used in web development for authentication and information exchange between 
//a client and a server.
// there are three steps:- header, payload, signature -> secret key (HMAC algo) and private key (RSA algo)

//bcrypt ==>bcrypt is a password-hashing function designed to securely hash passwords. It is commonly used 
//in web development to store user passwords in a way that protects them from various security threats, 
//such as brute-force attacks and rainbow table attacks. 
// hash format The output of bcrypt is a string that includes the salt, the cost factor, and the actual hash. 
//The format typically looks like this: $2a$12$randomSaltAndHash.


//ejs  ==> Embedded JavaScript, is a templating engine for JavaScript that allows you to embed JavaScript code 
//within your HTML or other markup. It is commonly used in web development to generate dynamic content on the 
//server side and render HTML pages dynamically.

//async  function ik promise return krta ha.
//await aur await function jb tk voh promise resolve nhi hoo jata voh wait krta ha.