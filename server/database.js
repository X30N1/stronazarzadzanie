var sqlite3 = require("sqlite3").verbose();

const dbsource = "./sql/database.sqlite";

var db = new sqlite3.Database(dbsource, (error) => {
    if (error) {
      console.error(error.message);
      throw error;
    }
    else {
        console.log("Connected to the SQLite database.") 
    }
});

module.exports = db;