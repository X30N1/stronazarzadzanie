const express = require("express")
const session = require('express-session');
const bcrypt = require("bcrypt")
const app = express()
const db = require("./database.js")
const path = require("path");

app.use(express.urlencoded())
app.use(express.json())
app.use(express.static('public'));
app.use(session({
    secret: 'insanely secret shenanigans on the webs woah',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 28800000
    }
}));

const serverPort = 8000;

app.listen(serverPort, () => {
    console.log("Server running on port %PORT%".replace("%PORT%", serverPort));
})

app.get("/", (request, response, next) => {
    response.sendFile(path.join(__dirname, "/public/logowanie.html"));
  });
  
app.get("/login", (request, response, next) => {
    response.sendFile(path.join(__dirname, "/public/logowanie.html"));
});

app.get("/dashboard", (request, response, next) => {
    response.sendFile(path.join(__dirname, "/public/dashboard.html"));

    const isLoggedIn = request.session.isLoggedIn;
    const username = request.session.username;

    if (isLoggedIn) {
        response.render('dashboard', { username });
    } else {
        response.redirect('/login');
    }
});

app.get("/api", (request, response, next) => {
    response.json({"message":"success"})
})

app.post("/api/accounts/login", (request, response, next) => {

    const login = request.body.login
    const password = request.body.password

    var sql = ""
    var parameters = []
    var hash

    sql = "SELECT password FROM accounts WHERE cardID = %login%;"
    .replace("%login%", login) 

    db.all(sql, parameters, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        hash = sqlResponse[0].password
    })

    bcrypt.compare(password, hash, function(err, result) {
        if(!result) {
            response.redirect("/login")
            return response.json({"error":err})
        }
        request.session.isLoggedIn = true;
        request.session.username = login;

        response.redirect("/dashboard")
    })

})

app.get("/api/accounts/logout", (request, response) => {
    request.session.destroy((err) => {
        if (err) {
            console.log(err)
        }
        else {
            response.redirect("/login")
        }
    })
})

app.post("/api/appointments", (request, response, next) => {

    const login = request.body.login
    const password = request.body.password
    const limit = request.body.limit
    const offset = request.body.offset * limit

    var sql = ""
    var parameters = []

    sql = "SELECT * FROM appointments WHERE LIMIT %limit% OFFSET %offset%;"
    .replace("%limit%", limit) 
    .replace("%offset%", offset) 

    db.all(sql, parameters, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        return response.json({"success":sqlResponse})
    })
})

app.use(function(request, response){
    response.status(404).json({"error":"404"})
    return
});