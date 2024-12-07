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

function createAdminAccount() {
    const sqlA = "SELECT * FROM accounts WHERE login = 'admin';"
    const parameters = []

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

            bcrypt.hash(apassword, saltRounds, function(error, hash) {
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
    response.sendFile(path.join(__dirname, "/public/index.html"));
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

app.get("/personel/dashboard", (request, response, next) => {

    const isLoggedIn = request.session.isLoggedIn;
    const privilege = request.session.privilege;
    
    if (isLoggedIn && privilege == 1) {
        response.sendFile(path.join(__dirname, "/public/dashboard.html"));
    } 
    else if (isLoggedIn && privilege == 2) {
        response.sendFile(path.join(__dirname, "/public/admin.html"));
    }
    else {
        response.redirect('/personel/login');
    }
});

app.get("/api", (request, response, next) => {
    response.json({"message":"success"})
})

app.post("/api/cert/password", (request, response) => {

    const password = request.body.password
    console.log(password)
    sql = ("SELECT * FROM commonPasswords WHERE password = '%password%';")
        .replace("%password%", password)

    db.all(sql, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        else if(sqlResponse.length == 0) {
            console.log(sql)
            console.log(request.body.password)
            return response.json({"message": "success"})
        }
        else {
            console.log(sql)
            console.log(request.body.password)
            return response.json({"message": "failure"})
        }
    });

});

app.post("/api/accounts/login", (request, response, next) => {

    const login = request.body.login
    const password = request.body.password

    var sql = ""
    var parameters = []

    sql = "SELECT accountID, password, name, lname, privilege FROM accounts WHERE login = '%login%';"
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
        var id = sqlResponse[0].accountID
        var privilege = sqlResponse[0].privilege

        bcrypt.compare(password, hash, function(err, result) {
            if(!result || err) {
                response.json({"message":"failure"})
                return
            }
            request.session.isLoggedIn = true
            request.session.id = id
            request.session.login = login
            request.session.name = name
            request.session.lname = lname
            request.session.privilege = privilege
    
            response.json({
                "message":"success",
                id: id,
                login: login,
                name: name,
                lname: lname,
                privilege: privilege
            })
            return
        })
    })
})

app.get("/logout", (request, response) => {
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

    sql = "SELECT patientID, patientPassword, patientName, patientLName FROM patients WHERE patientLogin = '%login%';"
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

        var hash = sqlResponse[0].patientPassword
        var name = sqlResponse[0].patientName
        var lname = sqlResponse[0].patientLName
        var id = sqlResponse[0].patientID

        bcrypt.compare(password, hash, function(err, result) {
            if(!result || err) {
                response.json({"message":"failure"})
                return
            }
            request.session.isPatientLoggedIn = true
            request.session.id = id
            request.session.login = login
            request.session.name = name
            request.session.lname = lname

            response.json({
                "message":"success",
                id: id,
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
    .replace("%patientAddress%", patientAddress)

    sql2 = "INSERT INTO patients VALUES (null, null, null, '%patientName%', '%patientLName%', null, '%patientContact%', '%patientAddress%');"
    .replace("%patientName%", patientName)
    .replace("%patientLName%", patientLName)
    .replace("%patientContact%", patientContact)
    .replace("%patientAddress%", patientAddress)

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
                response.status(400).json({"error":error2.message})
                return
            }

            db.all(sql, parameters, (error3, sqlResponse3) => {

                if (error3) {
                    response.status(400).json({"error":error3.message})
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

    const patientID = request.body.patientID
    const patientName = request.body.patientName
    const patientLName = request.body.patientLName
    const patientContact = request.body.patientContact
    const patientAddress = request.body.patientAddress
    const patientEmail = request.body.email

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

app.post("/api/patients/changepassword", (request, response, next) => {

    const patientID = request.body.id
    const password = request.body.password
    const newPassword = request.body.newPassword

    var sql = ""
    var parameters = []

    sql = "SELECT patientPassword FROM patients WHERE patientID = '%patientID%';"
    .replace("%patientID%", patientID) 

    var sql2 = "UPDATE patients SET patientPassword = '%newPassword%' WHERE patientID = '%patientID%';"
    .replace("%patientID%", patientID) 

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

        var hash = sqlResponse[0].patientPassword

        bcrypt.compare(password, hash, function(err, result) {
            if(!result || err) {
                response.json({"message":"failure"})
                return
            }
            
            bcrypt.hash(newPassword, saltRounds, function(error, hash2) {
                if (error) {
                    return response.json({"error":err})
                }
        
                sql2 = sql2.replace('%newPassword%', hash2)
                var parameters = []
        
                db.all(sql, parameters, (error, sqlResponse) => {
                    if (error) {
                        response.status(400).json({"error":error.message})
                        return
                    }
                    return response.json({"message":"success"})
                })
            });
        })
    })
})

app.post("/api/accounts/changepassword", (request, response, next) => {

    const id = request.body.id
    const password = request.body.password
    const newPassword = request.body.newPassword

    var sql = ""
    var parameters = []

    sql = "SELECT accountID, password FROM accounts WHERE accountID = '%accountID%';"
    .replace("%patientID%", id) 

    var sql2 = "UPDATE accounts SET password = '%newPassword%' WHERE accountID = '%accountID%';"
    .replace("%patientID%", id) 

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

        bcrypt.compare(password, hash, function(err, result) {
            if(!result || err) {
                response.json({"message":"failure"})
                return
            }
            
            bcrypt.hash(newPassword, saltRounds, function(error, hash2) {
                if (error) {
                    return response.json({"error":err})
                }
        
                sql2 = sql2.replace('%newPassword%', hash2)
                var parameters = []
        
                db.all(sql, parameters, (error, sqlResponse) => {
                    if (error) {
                        response.status(400).json({"error":error.message})
                        return
                    }
                    return response.json({"message":"success"})
                })
            });
        })
    })
})

app.post("/api/patients/selectappointments", (request, response, next) => {

    const limit = request.body.limit
    const offset = request.body.offset * limit
    const id = request.body.id

    var sql = ""
    var parameters = []

    sql = "SELECT a.appointmentid, a.appointmentDate, a.appointmentTime, aa.name, aa.lname FROM appointments AS a INNER JOIN accounts AS aa ON a.accountID = aa.accountID WHERE a.patientID = %id% ORDER BY a.appointmentDate DESC, a.appointmentTime DESC LIMIT %limit% OFFSET %offset%;"
    .replace("%limit%", limit) 
    .replace("%offset%", offset)
    .replace("%id%", id)

    db.all(sql, parameters, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        return response.json({"success":sqlResponse})
    })
})

app.post("/api/patients/count", (request, response, next) => {

    const id = request.body.id

    var sql = ""
    var parameters = []

    sql = "SELECT COUNT(appointmentID) AS 'count' FROM appointments WHERE patientID = %id%;"
    .replace("%id%", id)

    db.all(sql, parameters, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        return response.json({"success":sqlResponse})
    })
})

app.post("/api/patients/checktaken", (request, response, next) => {
  
    const date = request.body.date
    const accountID = request.body.id

    var sql = ""
    var parameters = []

    sql = "SELECT appointmentTime FROM appointments WHERE appointmentDate = '%date%' AND accountID = %accountID% ORDER BY appointmentTime DESC;"
    .replace("%date%", date)
    .replace("%accountID%", accountID)

    db.all(sql, parameters, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        return response.json({"success":sqlResponse})
    })
})

app.post("/api/patients/getpersonel", (request, response, next) => {
  
    var sql = ""
    var parameters = []

    sql = "SELECT accountid, name, lname, email FROM accounts WHERE privilege = '1';"

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
    
    if(privilege < 1) {
        return response.status(400).json({"error":"insufficient permissions"})
    }

    const limit = request.body.limit
    const offset = request.body.offset * limit
    const id = request.body.id

    var sql = ""
    var parameters = []

    sql = "SELECT a.appointmentid, a.appointmentDate, a.appointmentTime, a.appointmentStatus, p.patientName, p.patientLName, p.patientContact, p.patientAddress FROM appointments AS a INNER JOIN patients AS p ON a.patientID = p.patientID WHERE a.accountID = %id% ORDER BY a.appointmentDate DESC, a.appointmentTime DESC LIMIT %limit% OFFSET %offset%;"
    .replace("%limit%", limit) 
    .replace("%offset%", offset)
    .replace("%id%", id)

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

    const id = request.body.id

    var sql = ""
    var parameters = []

    sql = "SELECT COUNT(appointmentID) AS 'count' FROM appointments WHERE accountID = %id%;"
    .replace("%id%", id)

    db.all(sql, parameters, (error, sqlResponse) => {
        if (error) {
            response.status(400).json({"error":error.message})
            return
        }
        return response.json({"success":sqlResponse})
    })
})

app.post("/api/appointments/add", (request, response, next) => {

    const accountID = request.body.accountID
    const patientID = request.body.patientID
    const appointmentDate = request.body.date
    const appointmentTime = request.body.time
    const appointmentStatus = "Zaplanowane"

    var sql = ""
    var parameters = []

    sql = "INSERT INTO appointments VALUES (null, %accountID%, %patientID%, '%appointmentDate%', '%appointmentTime%', '%appointmentStatus%');"
    .replace("%accountID%", accountID)
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

    const appointmentID = request.body.id

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