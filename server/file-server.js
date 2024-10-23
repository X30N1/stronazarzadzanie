const express = require("express");
const app = express();
const path = require("path");

const serverPort = 80;
app.listen(serverPort, () => {
  console.log("Server running on port %PORT%".replace("%PORT%", serverPort));
});

app.use(express.static('public'));

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.use(function(req, res){
    res.status(404).sendFile(path.join(__dirname, "/public/404.html"));
});