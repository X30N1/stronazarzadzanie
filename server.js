const express = require("express")
const session = require('express-session');
const bcrypt = require("bcrypt")
const saltRounds = 10;
const app = express()
const db = require("./database/database.js")
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
app.set('view engine', 'jade')

const serverPort = 8000;

app.listen(serverPort, () => {
    console.log("Server running on port %PORT%".replace("%PORT%", serverPort));
})

app.get("/", (request, response, next) => {
    response.redirect('/login');
  });
  
app.get("/login", (request, response, next) => {
    response.sendFile(path.join(__dirname, "/public/logowanie.html"));
});

app.get("/register", (request, response, next) => {
    response.sendFile(path.join(__dirname, "/public/rejestracja.html"));
});

app.get("/przypomnij", (request, response, next) => {
    response.sendFile(path.join(__dirname, "/public/przypomnij.html"));
});

app.get("/dashboard", (request, response, next) => {

    const isLoggedIn = request.session.isLoggedIn;
    
    if (isLoggedIn) {
        response.sendFile(path.join(__dirname, "/public/dashboard.html"));
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

    sql = "SELECT password, name, lname, privilege FROM accounts WHERE login = '%login%';"
    .replace("%login%", login) 

    db.all(sql, parameters, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }

        var hash = sqlResponse[0].password
        var name = sqlResponse[0].name
        var lname = sqlResponse[0].lname
        var privilege = sqlResponse[0].privilege

        bcrypt.compare(password, hash, function(err, result) {
            if(!result) {
                response.json({"message":"failure"})
                return
            }
            request.session.isLoggedIn = true
            request.session.login = login
            request.session.name = name
            request.session.lname = lname
            request.session.privilege = privilege
    
            response.json({
                "message":"success",
                login: login,
                name: name,
                lname: lname,
                privilege: privilege
            })
            return
        })
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

    bcrypt.hash(password, saltRounds, function(error, hash) {
        if (error) {
            return response.json({"error":err})
        }

        var sql = ""
        var parameters = []

        sql = "INSERT INTO accounts VALUES (null, '%login%', '%password%', '%name%', '%lname%', '%email%', %privilege%);"
        .replace("%login%", login)
        .replace("%password%", hash)
        .replace("%name%", name)
        .replace("%lname%", lname)
        .replace("%email%", email)
        .replace("%privilege%", privilege)

        db.all(sql, parameters, (error, sqlResponse) => {
            if (error) {
                response.status(400).json({"error":error.message})
                return
            }
            return response.json({"message":"success"})
        })

    });

})

app.post("/api/patients/select", (request, response, next) => {

    const privilege = request.body.privilege
    const patientID = request.body.patientID

    if(privilege < 1) {
        return response.status(400).json({"error":"insufficient permissions"})
    }

    var sql = ""
    var parameters = []

    sql = "SELECT * FROM patients WHERE patientID = %patientID%;"
    .replace("%patientID%", patientID)

    db.all(sql, parameters, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        return response.json({"success":sqlResponse})
    })
})

app.post("/api/patients/add", (request, response, next) => { // Masakra, pewnie można to lepiej, ale na razie jest tak xD

    const privilege = request.body.privilege
    const patientName = request.body.name
    const patientLName = request.body.lname
    const patientContact = request.body.contact

    if(privilege < 1) {
        return response.status(400).json({"error":"insufficient permissions"})
    }

    var sql = ""
    var sql2 = ""
    var parameters = []

    sql = "SELECT patientID FROM patients WHERE patientName = '%patientName%' AND patientLName = '%patientLName%' AND patientContact = '%patientContact%';"
    .replace("%patientName%", patientName)
    .replace("%patientLName%", patientLName)
    .replace("%patientContact%", patientContact)

    sql2 = "INSERT INTO patients VALUES (null, '%patientName%', '%patientLName%', '%patientContact%');"
    .replace("%patientName%", patientName)
    .replace("%patientLName%", patientLName)
    .replace("%patientContact%", patientContact)

    db.all(sql, parameters, (error, sqlResponse) => {

        if (error) {
            response.status(400).json({"error":error.message})
            return
        }

        if(sqlResponse.length != 0) {
            response.json({"success":sqlResponse})
            return
        }

        db.all(sql2, parameters, (error2, sqlResponse2) => {

            if (error2) {
                response.status(400).json({"error":error.message})
                return
            }

            db.all(sql, parameters, (error3, sqlResponse3) => {

                if (error3) {
                    response.status(400).json({"error":error.message})
                    return
                }
                
                response.json({"success":sqlResponse3})
                return

            })
        })
    })
})

app.post("/api/patients/update", (request, response, next) => {

    const privilege = request.body.privilege
    const patientID = request.body.patientID
    const patientName = request.body.patientName
    const patientLName = request.body.patientLName
    const patientContact = request.body.patientContact

    if(privilege < 1) {
        return response.status(400).json({"error":"insufficient permissions"})
    }

    var sql = ""
    var parameters = []

    sql = "INSERT patients SET patientName = '%patientName%', patientLName = '%patientLName%', patientContact = '%patientContact%' WHERE patientID = %patientID%;"
    .replace("%patientName", patientName)
    .replace("%patientLName%", patientLName)
    .replace("%patientContact%", patientContact)
    .replace("%patientID%", patientID)

    db.all(sql, parameters, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        return response.json({"success":sqlResponse})
    })
})

app.post("/api/appointments/select", (request, response, next) => {

    const privilege = request.body.privilege
    const limit = request.body.limit
    const offset = request.body.offset * limit

    var sql = ""
    var parameters = []

    sql = "SELECT * FROM appointments LIMIT %limit% OFFSET %offset%;"
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

app.post("/api/appointments/count", (request, response, next) => {

    const privilege = request.body.privilege

    if(privilege < 1) {
        return response.status(400).json({"error":"insufficient permissions"})
    }

    var sql = ""
    var parameters = []

    sql = "SELECT COUNT(appointmentID) AS 'count' FROM appointments;"

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

    sql = "INSERT INTO appointments VALUES (null, %patientID%, '%appointmentDate%', '%appointmentTime%', '%appointmentStatus%');"
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

app.post("/api/appointments/update", (request, response, next) => {

    const privilege = request.body.privilege
    const appointmentID = request.body.appointmentID
    const patientID = request.body.patientID
    const appointmentDate = request.body.appointmentDate
    const appointmentTime = request.body.appointmentTime
    const appointmentStatus = request.body.appointmentStatus

    if(privilege < 1) {
        return response.status(400).json({"error":"insufficient permissions"})
    }

    var sql = ""
    var parameters = []

    sql = "UPDATE appointments SET patientID = %patientID%, appointmentDate = '%appointmentDate%', appointmentTime = '%appointmentTime%', appointmentStatus = '%appointmentStatus%' WHERE appointmentID = %appointmentID%;"
    .replace("%patientID%", patientID)
    .replace("%appointmentDate%", appointmentDate)
    .replace("%appointmentTime", appointmentTime)
    .replace("%appointmentStatus", appointmentStatus)
    .replace("%appointmentID%", appointmentID)

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