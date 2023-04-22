//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const homeStartingContent = "Hello! Welcome To Web Development Bootcamp Family! If you do not alreay have a profile, please register now and start to log your web development journey!";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

const expressSession=require('express-session')({
  secret: 'secret',
  resave:false,
  saveUninitialized:true,
  cookie: {
      secure:false,
      maxAge:60000
  }
});


app.use(expressSession);


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Passport Setup

const passport=require('passport');

app.use(passport.initialize());
app.use(passport.session());

/*Login Page*/

const passportLocalMongoose = require('passport-local-mongoose');
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const Schema=mongoose.Schema;

const userSchema =new Schema({
  username: String,
  bio: String
});


userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);


//Passport Local Authentication
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Routes
const connectEnsureLogin=require('connect-ensure-login');

app.post('/login',(req,res,next) => {
    passport.authenticate('local',
        (err,user,info)=>{
            if (err){
                return next(err);
            }
            if(!user){
                return res.redirect('/login?info='+info);
            }
            req.logIn(user,function(err){
                if (err){
                    return next(err);
                }
                return res.redirect('/');
            });
        }) (req,res,next);
    });

app.get('/login',
    (req,res) => res.render('login'));


/*Home page*/
app.get("/", function(req, res){
  User.find({})
    .then(function(user){
    
    res.render("home", {
      startingContent: homeStartingContent,
      user: user
    })
  }) }
);


/*Register Page*/
app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){
  const user = new User({
    username: req.body.username,
    bio: req.body.bio
  });


  user.save();

  res.redirect("/");
});



/*Register Page*/
app.get("/userprofile/:username", function(req, res){

const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

});



/*About Page*/
app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});


/*About Contact*/
app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});





/*Port*/
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
