const express = require("express")
const session = require('express-session');
const bcrypt = require("bcrypt")
const saltRounds = 10;
const app = express()
const db = require("database.js")
const path = require("path");

app.use(express.urlencoded())
app.use(express.json())
app.use(express.static('public'));
app.use(session({
    secret: 'insanely secret shenanigans on the webs woah',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 43200000
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

app.get("/przypomnij", (request, response, next) => {
    response.sendFile(path.join(__dirname, "/public/przypomnij.html"));
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
    var name
    var lname
    var privilege

    sql = "SELECT password, name, lname, privilege FROM accounts WHERE login = %login%;"
    .replace("%login%", login) 

    db.all(sql, parameters, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        hash = sqlResponse[0].password
        name = sqlResponse[0].name
        lname = sqlResponse[0].lname
        privilege = sqlResponse[0].privilege
    })

    bcrypt.compare(password, hash, function(err, result) {
        if(!result) {
            response.redirect("/login")
            return response.json({"error":err})
        }
        request.session.isLoggedIn = true
        request.session.login = login
        request.session.name = name
        request.session.lname = lname
        request.session.privilege = privilege

        response.redirect("/dashboard")
        return response.json({"success":true})
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

app.post("/api/accounts/register", (request, response, next) => {

    const login = request.body.login
    const password = request.body.password
    const name = request.body.name
    const lname = request.body.lname
    const email = request.body.email
    const privilege = request.body.privilege

    var sql = ""
    var parameters = []
    var hashedPwd

    bcrypt.hash(password, saltRounds, function(error, hash) {
        if (error) {
            return response.json({"error":err})
        }
        hashedPwd = hash
    });

    sql = "INSERT INTO accounts VALUES (null, %login%, %password%, %name%, %lname%, %email%, %privilege%);"
    .replace("%login%", login)
    .replace("%password%", hashedPwd)
    .replace("%name%", name)
    .replace("%lname%", lname)
    .replace("%email%", email)
    .replace("%privilege%", privilege)

    db.all(sql, parameters, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        response.json({"success":sqlResponse})
        response.redirect("/login")
    })
})

app.post("/api/appointments", (request, response, next) => {

    const privilege = request.body.privilege
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


app.post("/api/appointments/add", (request, response, next) => {

    const privilege = request.body.privilege
    const patientID = request.body.patientID
    const appointmentDate = request.body.appointmentDate
    const appointmentTime = request.body.appointmentTime
    const appointmentStatus = request.body.appointmentStatus

    if(privilege < 1) {
        return response.status(400).json({"error":"insufficient permissions"})
    }

    var sql = ""
    var parameters = []

    sql = "INSERT INTO appointments VALUES (null, %patientID%, %appointmentDate%, %appointmentTime%, %appointmentStatus%);"
    .replace("%patientID%", patientID)
    .replace("%appointmentDate%", appointmentDate)
    .replace("%appointmentTime", appointmentTime)
    .replace("%appointmentStatus", appointmentStatus)

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