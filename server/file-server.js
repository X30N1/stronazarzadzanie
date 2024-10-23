const express = require("express");
const app = express();
const path = require("path");

const serverPort = 80;
app.listen(serverPort, () => {
  console.log("Server running on port %PORT%".replace("%PORT%", serverPort));
});

app.use(express.static('public'));

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "/public/logowanie.html"));
});

app.get("/login", (req, res, next) => {
  res.sendFile(path.join(__dirname, "/public/logowanie.html"));
});

app.get("/dashboard", (req, res, next) => {
  res.sendFile(path.join(__dirname, "/public/dashboard.html"));
});

app.use(function(req, res){
    res.status(404).sendFile(path.join(__dirname, "/public/404.html"));
});