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

async function createAdminAccount() {
    const sqlA = "SELECT * FROM accounts WHERE login = 'admin';"

    db.all(sqlA, parameters, (error, sqlResponse) => {
        if (error) {
            console.log(error.message)
            return
        }

        if(sqlResponse.length == 0) {
            const alogin = "admin"
            const apassword = "admin"
            const aname = "Administrator"
            const alname = "Kont"
            const aemail = "admin@farmaceutanasz.pl"
            const aprivilege = 2

            bcrypt.hash(password, saltRounds, function(error, hash) {
                if (error) {
                    return response.json({"error":err})
                }

                var sql = ""
                var parameters = []

                sql = "INSERT INTO accounts VALUES (null, '%login%', '%password%', '%name%', '%lname%', '%email%', %privilege%);"
                .replace("%login%", alogin)
                .replace("%password%", hash)
                .replace("%name%", aname)
                .replace("%lname%", alname)
                .replace("%email%", aemail)
                .replace("%privilege%", aprivilege)

                db.all(sql, parameters, (error, sqlResponse) => {
                    if (error) {
                        console.log(error.message)
                        return
                    }
                    console.log("Dodano konto administratora.")
                    return
                })

            });

            console.log("Konto administratora już istnieje.")
            return
        }
    })
}

createAdminAccount()

app.get("/", (request, response, next) => {
    response.sendFile(path.join(__dirname, "/public/patient-dashboard.html"));
});
  
app.get("/login", (request, response, next) => {
    response.sendFile(path.join(__dirname, "/public/patient-login.html"));
});

app.get("/register", (request, response, next) => {
    response.sendFile(path.join(__dirname, "/public/patient-register.html"));
});
  
app.get("/personel/login", (request, response, next) => {
    response.sendFile(path.join(__dirname, "/public/login.html"));
});

app.get("/personel/register", (request, response, next) => {
    response.sendFile(path.join(__dirname, "/public/register.html"));
});

// app.get("/przypomnij", (request, response, next) => {
//     response.sendFile(path.join(__dirname, "/public/przypomnij.html"));
// });

app.get("/dashboard", (request, response, next) => {

    const isLoggedIn = request.session.isPatientLoggedIn;
    
    if (isLoggedIn) {
        response.sendFile(path.join(__dirname, "/public/patient-dashboard.html"));
    } else {
        response.redirect('/login');
    }
});

app.get("/css/login", (request, response, next) => {
    response.sendFile(path.join(__dirname, "/public/css/login.css"));
});

app.get("/personel/dashboard", (request, response, next) => {

    const isLoggedIn = request.session.isLoggedIn;
    const privilage = request.session.privilage;
    
    if (isLoggedIn && privilage == 1) {
        response.sendFile(path.join(__dirname, "/public/dashboard.html"));
    } 
    else if (isLoggedIn && privilage == 2) {
        response.sendFile(path.join(__dirname, "/public/admin.html"));
    }
    else {
        response.redirect('/personel/login');
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
        if(sqlResponse.length == 0) {
            response.json({
                "message": "doesntExist"
            })
            return
        }

        var hash = sqlResponse[0].password
        var name = sqlResponse[0].name
        var lname = sqlResponse[0].lname
        var privilege = sqlResponse[0].privilege

        bcrypt.compare(password, hash, function(err, result) {
            if(!result || err) {
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
            response.json({"message":"failure"})
        }
        else {
            response.json({"message":"success"})
        }
    })
})

app.get("api/cert/password", (request, response) => {

    const password = request.body.password
    sql = ("SELECT * FROM passwords WHERE password = '%password%';")
        .replace("%password%", password)

    db.certchecker.all(sql, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        else if(sqlResponse.length == 0) {
            return response.json({"message": "success"})
        }
        else {
            return response.json({"message": "failure"})
        }
    });

});

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

app.post("/api/accounts/update", (request, response, next) => {

    const privilege = request.body.privilege
    const id = request.body.patientID
    const name = request.body.patientName
    const lname = request.body.patientLName
    const email = request.body.patientContact

    if(privilege < 2) {
        return response.status(400).json({"error":"insufficient permissions"})
    }

    var sql = ""
    var parameters = []

    sql = "UPDATE accounts SET name = '%name%', lname = '%lname%', email = '%email%' WHERE accountID = %id%;"
    .replace("%name%", name)
    .replace("%lname%", lname)
    .replace("%email%", email)
    .replace("%id%", id)

    db.all(sql, parameters, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        return response.json({"message":"success"})
    })
});

app.post("/api/patients/register", (request, response, next) => {

    const login = request.body.login
    const password = request.body.password
    const name = request.body.name
    const lname = request.body.lname
    const email = request.body.email
    const contact = request.body.contact
    const address = request.body.address

    bcrypt.hash(password, saltRounds, function(error, hash) {
        if (error) {
            return response.json({"error":err})
        }

        var sql = ""
        var parameters = []

        sql = "INSERT INTO patients VALUES (null, '%login%', '%password%', '%name%', '%lname%', '%email%', '%contact%', '%address%');"
        .replace("%login%", login)
        .replace("%password%", hash)
        .replace("%name%", name)
        .replace("%lname%", lname)
        .replace("%email%", email)
        .replace("%contact%", contact)
        .replace('%address%', address)

        db.all(sql, parameters, (error, sqlResponse) => {
            if (error) {
                response.status(400).json({"error":error.message})
                return
            }
            return response.json({"message":"success"})
        })
    });
})

app.post("/api/patients/login", (request, response, next) => {

    const login = request.body.login
    const password = request.body.password

    var sql = ""
    var parameters = []

    sql = "SELECT patientPassword, patientName, patientLName FROM patients WHERE patientLogin = '%login%';"
    .replace("%login%", login) 

    db.all(sql, parameters, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        if(sqlResponse.length == 0) {
            response.json({
                "message": "doesntExist"
            })
            return
        }

        var hash = sqlResponse[0].password
        var name = sqlResponse[0].name
        var lname = sqlResponse[0].lname

        bcrypt.compare(password, hash, function(err, result) {
            if(!result || err) {
                response.json({"message":"failure"})
                return
            }
            request.session.isPatientLoggedIn = true
            request.session.login = login
            request.session.name = name
            request.session.lname = lname

            response.json({
                "message":"success",
                login: login,
                name: name,
                lname: lname
            })
            return
        })
    })
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
    const patientAddress = request.body.address

    if(privilege < 1) {
        return response.status(400).json({"error":"insufficient permissions"})
    }

    var sql = ""
    var sql2 = ""
    var parameters = []

    sql = "SELECT patientID FROM patients WHERE patientName = '%patientName%' AND patientLName = '%patientLName%' AND patientContact = '%patientContact%' AND patientAddress = '%patientAddress%';"
    .replace("%patientName%", patientName)
    .replace("%patientLName%", patientLName)
    .replace("%patientContact%", patientContact)
    .replace("%patientAddress", patientAddress)

    sql2 = "INSERT INTO patients VALUES (null, '', '', '%patientName%', '%patientLName%', '%patientContact%', %patientAddress%);"
    .replace("%patientName%", patientName)
    .replace("%patientLName%", patientLName)
    .replace("%patientContact%", patientContact)

    db.all(sql, parameters, (error, sqlResponse) => {

        if (error) {
            response.status(400).json({"error":error.message})
            return
        }

        if(sqlResponse.length != 0) {
            response.json({
                "message": "success",
                "success":sqlResponse
            })
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
                
                response.json({
                    "message": "success",
                    "success":sqlResponse3
                })
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
    const patientAddress = request.body.patientAddress
    const patientEmail = request.body.email

    if(privilege < 1) {
        return response.status(400).json({"error":"insufficient permissions"})
    }

    var sql = ""
    var parameters = []

    sql = "UPDATE patients SET patientName = '%patientName%', patientLName = '%patientLName%', patientContact = '%patientContact%', patientAddress = '%patientAdress%', patientEmail = '%patientEmail%' WHERE patientID = %patientID%;"
    .replace("%patientName", patientName)
    .replace("%patientLName%", patientLName)
    .replace("%patientContact%", patientContact)
    .replace("%patientID%", patientID)
    .replace("%patientAddress", patientAddress)
    .replace("%patientEmail%", patientEmail)

    db.all(sql, parameters, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        return response.json({"message":"success"})
    })

})

app.post("/api/appointments/select", (request, response, next) => {

    const privilege = request.body.privilege
    
    if(privilege < 1) {
        return response.status(400).json({"error":"insufficient permissions"})
    }

    const limit = request.body.limit
    const offset = request.body.offset * limit

    var sql = ""
    var parameters = []

    sql = "SELECT a.appointmentid, a.appointmentDate, a.appointmentTime, a.appointmentStatus, p.patientName, p.patientLName, p.patientContact FROM appointments AS a INNER JOIN patients AS p ON a.patientID = p.patientID ORDER BY a.appointmentDate DESC, a.appointmentTime DESC LIMIT %limit% OFFSET %offset%;"
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
    const appointmentDate = request.body.date
    const appointmentTime = request.body.time
    const appointmentStatus = "Zaplanowane"

    if(privilege < 1) {
        return response.status(400).json({"error":"insufficient permissions"})
    }

    var sql = ""
    var parameters = []

    sql = "INSERT INTO appointments VALUES (null, %patientID%, '%appointmentDate%', '%appointmentTime%', '%appointmentStatus%');"
    .replace("%patientID%", patientID)
    .replace("%appointmentDate%", appointmentDate)
    .replace("%appointmentTime%", appointmentTime)
    .replace("%appointmentStatus%", appointmentStatus)

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
    const appointmentDate = request.body.date
    const appointmentTime = request.body.time
    const appointmentStatus = request.body.status

    if(privilege < 1) {
        return response.status(400).json({"error":"insufficient permissions"})
    }

    var sql = ""
    var parameters = []

    sql = "UPDATE appointments SET patientID = %patientID%, appointmentDate = '%appointmentDate%', appointmentTime = '%appointmentTime%', appointmentStatus = '%appointmentStatus%' WHERE appointmentID = %appointmentID%;"
    .replace("%patientID%", patientID)
    .replace("%appointmentDate%", appointmentDate)
    .replace("%appointmentTime%", appointmentTime)
    .replace("%appointmentStatus%", appointmentStatus)
    .replace("%appointmentID%", appointmentID)

    db.all(sql, parameters, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        return response.json({"message":"success"})
    })
})

app.post("/api/appointments/remove", (request, response, next) => {

    const privilege = request.body.privilege
    const appointmentID = request.body.id

    if(privilege < 1) {
        return response.status(400).json({"error":"insufficient permissions"})
    }

    var sql = ""
    var parameters = []

    sql = "DELETE FROM appointments WHERE appointmentID = %appointmentID%;"
    .replace("%appointmentID%", appointmentID)
    
    db.all(sql, parameters, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        return response.json({"message":"success"})
    })
})

app.use(function(request, response){
    response.status(404).json({"error":"404"})
    return
});