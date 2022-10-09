const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose=require("mongoose"); 
const session = require('express-session')
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const e = require("express");



const homeStartingContent = "It is a Blog or Daily journal where you can delete or add the posts and have a track of your daily routine.";
const aboutContent = "It is a Blog or Daily Journal where you can add delete update the posts  and have a track of your daily routine";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret:"Our little secret",
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://IshanMakkar:7yU7LMvLZAfWYjZL@cluster0.amlqq.mongodb.net/blogDB",{ useNewUrlParser: true ,useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);


const userSchema=new mongoose.Schema(
  {
      email: String,
      password: String,
      posts:[]
  }
  );

userSchema.plugin(passportLocalMongoose);

const User=mongoose.model("User",userSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());







app.get("/",function(req,res)
{
  if(!req.isAuthenticated())
  {
    res.redirect("/rl");
  }
  else
  {
    console.log(req.user);
    var posts=[];
    posts=req.user.posts;
    res.render("home",{homeStartingContent:homeStartingContent,posts:posts});
  }
})


app.get("/rl",function(req,res)
{
  if(!req.isAuthenticated())
  res.render("rl");
  else
  res.redirect("/");
})

app.get("/login",function(req,res)
{
  if(!req.isAuthenticated())
    res.render("login");
  else
    res.redirect("/");
})

app.get("/register",function(req,res)
{
    // if (req.isAuthenticated()){
    //     // req.user.posts.push(1);
    //     console.log(req.user);
    // //   res.render("secrets");
    // }
    if(!req.isAuthenticated())
    res.render("register");
    else
    res.redirect("/");
})


app.get("/about",function(req,res)
{
  if(req.isAuthenticated())
  res.render("about",{aboutContent:aboutContent});
  else
  req.redirect("/rl");
})

app.get("/contact",function(req,res)
{
  if(req.isAuthenticated())
  res.render("contact",{contactContent:contactContent});
  else
  res.redirect("/rl");
})

app.get("/compose",function(req,res)
{
  if(req.isAuthenticated())
  res.render("compose");
  else
  res.redirect("/rl");
})

app.get("/edit",function(req,res)
{
  if(req.isAuthenticated())
  res.render("edit");
  else
  res.redirect("/rl");
})


app.get("/posts/:topic",function(req,res)
{
  if(req.isAuthenticated())
  {
  const requestedTitle=_.lowerCase(req.params.topic);
  var i=0;
  for(i=0;i<req.user.posts.length;i++)
  {
    var k=_.lowerCase(req.user.posts[i].title);
    if(k===requestedTitle)
    {
      res.render("post",{title:req.user.posts[i].title,content:req.user.posts[i].content});
      break;
    }
  }

  if(i==req.user.posts.length)
  {
    res.send("Match Not Found");
  }

}
else
{
  res.redirect("/rl");
}
  
  










});

app.get("/remove",function(req,res)
{
  if(req.isAuthenticated())
  res.render("remove");
  else
  req.redirect("/rl");
})


app.post("/compose",function(req,res)
{
  var n=req.body.title;
  var k=req.body.post;
  
  var newPost={
    title:n,
    content:k
  };

  // console.log(newPost);
  // console.log(req.user);
  // var posts=req.user.posts;
  // console.log(posts);
  req.user.posts.push(newPost);
  req.user.save();
  // console.log(req.user);


  res.redirect("/");


})

app.post("/edit",function(req,res)
{
  var n=req.body.title;
  console.log(n);
  var k=req.body.post;
  console.log(req.user.posts);

  var i=0;
  for(;i<req.user.posts.length;i++)
  {
    if((req.user.posts[i]).title===n)
    {
      var newPost={
        title:n,
        content:k
      };
    
      var t=(req.user.posts).splice(i,1,newPost);
      // console.log(req.user);
      break;
    }
  }


  req.user.save();
  res.redirect("/");



})

app.post("/register",function(req,res)
{
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/");
          });
        }
      });
})

app.post("/login",function(req,res)
{
    const user = new User({
        username: req.body.username,
        password: req.body.password
      });
    
      req.login(user, function(err){
        if (err) {
            console.log(err);
          } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/");
              });
            }
          });
})

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/rl");
});




app.post("/remove",function(req,res)
{
  var n=req.body.title;
  var i=0;
  for(;i<req.user.posts.length;i++)
  {
    if(req.user.posts[i].title===n)
    {
      var k=req.user.posts.splice(i,1);
      req.user.save();
      break;
    }
  }

  res.redirect("/");
})









app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
