const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session=require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const auth = require("http-auth");
const path = require("path");
const basic = auth.basic({
  file: path.join(__dirname,"./users.htpasswd"),
});
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const helmet = require("helmet");
const {check, validationResult} = require("express-validator");

const welcomeContent = "Hello! Welcome To Web Development Bootcamp Family! If you do not alreay have a profile, please register now and start to log your web development journey!";
const aboutContent = "Prepare for an exciting career as a full stack web developer with a Coding Bootcamp Certificate from Westcliff University. Students learn today’s cutting-edge web development technologies taught by Westcliff’s professors. The program offers a fully immersive live online learning experience where students will gain proficiency in front end and back end web development technologies: HTML5, CSS3, Javascript ES6, Git, Github, MongoDB, Express, ReactJS, NodeJS, etc.";

const app = express();


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(mongoSanitize());
app.use(xss());
app.use(helmet());

app.use(session({
  secret:"our little secret.",
  resave:false,
  saveUninitialized:false,
  httpOnly:true,
  cookie:{
    secure:false,
    maxAge:60000  //60s
  }
}))

const limit = rateLimit({
  max:100,
  windowMs:60*60*1000,
  message:"Too many requests"
});

app.use('/users',limit);

app.use(express.json({limit:'10kb'}));

app.use(passport.initialize());
app.use(passport.session());


/*Set up database*/
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema =new mongoose.Schema({
  username: String,
  password: String,
  bio: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


/*Home page*/
app.get("/", function(req, res){
  User.find({})
    .then(function(user){
    res.render("home", {
      home_title:"Welcome",
      welcomeContent: welcomeContent,
     
    })
  }) }
);


/*Register Page*/
app.get("/register", function(req, res){
  res.render("register");
});


app.post("/register", 
[
  check('username').isLength({min:1}).withMessage('Please enter your name'),
],

function(req,res){
  const errors=validationResult(req);
  console.log(errors);
  if(errors.isEmpty()) {
    User.register({username:req.body.username,bio:req.body.bio},req.body.password, function(err,user){
      if(err){
        console.log(err);
      }else{
        passport.authenticate('local')(req, res, function(){
          res.redirect('/users');})
      }
    })
}else{
  res.redirect('/register')
}
});


/*Login Page*/
app.get('/login',(req,res)=>{
  res.render("login");
});

app.post('/login',(req,res)=>{
  const user = new User({
    username:req.body.username,
    password:req.body.password
  });

  req.login(user, function(err,user){
    if(err){
      console.log(err);
    }else{
      passport.authenticate('local')(req, res, function(){
        res.redirect('/users');})
      }
});
});

/*Users Page*/
app.get("/users", function(req, res){
  if(req.isAuthenticated()){
    User.find({})
    .then(function(user){
    res.render("users", {
      home_title: welcomeContent,
      user: user
    })
  })
  }else{
    res.redirect('/login');
  }

});

/*Logout Page*/
app.get("/logout", function(req, res){
  req.logout(function(){
    res.render("home",{
      home_title: "Thanks for visiting!",
      welcomeContent:"See you soon!"
    })
  });
});


/*About Page*/
app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});


app.get(
  "/registrants",
  basic.check((req, res) => {
    User.find()
      .then((user) => {
        res.render("registrants", {
          title: "Registrants",
          user:user  
        });
      })
      .catch(() => {
        res.send("Sorry! Something went wrong.");
      });
  })
);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    req.isLogged = true;
    return next();
  }
  res.redirect("/registrants");
}



module.exports = app;