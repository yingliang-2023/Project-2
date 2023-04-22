//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 2;

const welcomeContent = "Hello! Welcome To Web Development Bootcamp Family! If you do not alreay have a profile, please register now and start to log your web development journey!";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');



/*Set up database*/
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema =new mongoose.Schema({
  username: String,
  password: String,
  bio: String
});

const User = mongoose.model("User", userSchema);
     

/*Home page*/
app.get("/", function(req, res){
  User.find({})
    .then(function(user){
    res.render("home", {
      welcomeContent: welcomeContent,
      user: user
    })
  }) }
);


/*Login Page*/
app.get('/login',
    (req,res) => res.render('login'));

app.post("/login",(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
  
    User.findOne({username:username}).then(function(foundUser){
            
      bcrypt.compare(password,foundUser.password,function(err,result){
          if(result === true){
            res.render("home", {
              welcomeContent: welcomeContent,
              user: user
            })
          }
  })
})
});

/*Register Page*/
app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){

  bcrypt.hash(req.body.password,saltRounds,(err,hash)=>{
    const newUser=new User({
      username: req.body.username,
      password:hash,
      bio: req.body.bio
    });

    newUser.save();
    res.redirect('/')
});

});



/*userprofile Page*/
// app.get("/userprofile/:username", function(req, res){

// const requestedPostId = req.params.postId;

//   Post.findOne({_id: requestedPostId}, function(err, post){
//     res.render("post", {
//       title: post.title,
//       content: post.content
//     });
//   });

// });



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
