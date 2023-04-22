const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session=require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


const welcomeContent = "Hello! Welcome To Web Development Bootcamp Family! If you do not alreay have a profile, please register now and start to log your web development journey!";
const aboutContent = "Prepare for an exciting career as a full stack web developer with a Coding Bootcamp Certificate from Westcliff University. Students learn today’s cutting-edge web development technologies taught by Westcliff’s professors. The program offers a fully immersive live online learning experience where students will gain proficiency in front end and back end web development technologies: HTML5, CSS3, Javascript ES6, Git, Github, MongoDB, Express, ReactJS, NodeJS, etc.";

const app = express();


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(session({
  secret:"our little secret.",
  resave:false,
  saveUninitialized:false,
  cookie:{
    secure:false,
    maxAge:60000  //60s
  }
}))

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

app.post("/register", function(req, res){

  User.register({username:req.body.username,bio:req.body.bio},req.body.password, function(err,user){
    if(err){
      console.log(err);
    }else{
      passport.authenticate('local')(req, res, function(){
        res.redirect('/users');})
    }
  })
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



/*Port*/
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
