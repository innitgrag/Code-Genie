import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import bcrypt from "bcrypt";

const app = express();
const port = 8080;
const saltRounds=10;
dotenv.config();

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000*60*60*24,
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.render("login.ejs");
})

app.get("/register", (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.render("register.ejs");
});

app.get("/gpt" ,(req,res)=>{
    if(req.isAuthenticated())
        {
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
            res.render("gpt.ejs");
        }
        else{
            res.redirect("/");
        }
})

app.get("/auth/google" , passport.authenticate("google" , {
    scope: ["profile" , "email"],
}));

app.get(
    "/auth/google/gpt",
    passport.authenticate("google", {
      successRedirect: "/gpt",
      failureRedirect: "/",
    })
  );

app.post("/",  passport.authenticate("local", {
    successRedirect: "/gpt",
    failureRedirect: "/",
  })
);

app.get("/logout", (req, res) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
      res.redirect("/");
    });
  });

app.post("/register", async (req, res) => {

    const email = req.body.username;
    const password = req.body.password;

    try {
        const checkResult = await db.query("SELECT * FROM users WHERE email= $1", [email]);

        if (checkResult.rows.length > 0) {
            res.send("User already exits try logging in");
            
        }
        else {
            bcrypt.hash(password , saltRounds , async(err,hash)=>
            {
                if(err)
                {
                    console.log("Error hashing password: ", err);
                    res.send("Error occurred. Please try again later.");
                }else{
                const result = await db.query("INSERT INTO users (email , password) VALUES ($1 , $2) RETURNING *", [email, hash]);
               const user = result.rows[0];
               req.login(user,(err) => {
                if (err) {
                    console.log("Login error: ", err);
                    res.send("Error occurred during login. Please try again later.");
                } else {
                    res.redirect("/gpt");
                }
               });
            }
            });
        }
 } catch (err) {
        console.log(err);
    }

});


passport.use("google" , new GoogleStrategy({

    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/google/gpt",
},
async(accessToken , refreshToken , profile , cb)=>{
    console.log(profile);

    try {
        const email = profile.emails[0].value;
        const result = await db.query("SELECT * FROM users WHERE email= $1", [email]);

        if (result.rows.length === 0) {
           
            const newUser = await db.query(
            "INSERT INTO users (email , password) VALUES ($1 , $2) RETURNING * ", [email, "google"]);
            
            cb(null , newUser.rows[0]);
        }
        else {
            cb(null , result.rows[0]);
        }

    } catch (err) {
        cb(err);
    }
}
));


passport.use("local" , new Strategy (async function verify (username , password , cb)

{
    try {
        
        const result = await db.query("SELECT * FROM users WHERE email= $1", [username]);

        if(result.rows.length>0)
            {
                const user = result.rows[0];
                const storedHashPassword = user.password;

                bcrypt.compare(
                        password , storedHashPassword , (err , isMatch)=>{
                            if(err)
                                {
                                    return cb(err);
                                }
                            else{
                                if(isMatch)
                                    {
                                        return cb(null,user);
                                    }
                                else{
                                    return cb(null,false,{message: "Incorrect Password"});
                                }
                            }

                        });

            } else{
             return cb("User Not Found");
        }

    } catch (err) {

        return cb(err);

    }
}
));


passport.serializeUser((user,cb)=>{
    cb(null,user.id);
});

passport.deserializeUser((user,cb)=>{
    cb(null,user);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});