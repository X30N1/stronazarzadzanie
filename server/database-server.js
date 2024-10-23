const express = require("express")
const bcrypt = require("bcrypt")
const app = express()
const db = require("./database.js")


app.use(express.urlencoded())
app.use(express.json())

const serverPort = 8000;
app.listen(serverPort, () => {
    console.log("Server running on port %PORT%".replace("%PORT%", serverPort));
})

app.get("/", (request, response, next) => {
    response.json({"message":"success"});
})

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
            return response.json({"error":"invalid credentials"})
        }
        return response.json({"message":"success"})
    })
})

app.use(function(request, response){
    response.status(404).json({"error":"404"})
    return
});