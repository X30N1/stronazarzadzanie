var sqlite3 = require("sqlite3").verbose();

const dbsource = "./database/database.db";
const certsource = "./database/certbase.db";

var db = new sqlite3.Database(dbsource, (error) => {
    if (error) {
      console.error(error.message);
      throw error;
    }
    else {
        console.log("Connected to the SQLite database.") 
    }
});

var certchecker = new sqlite3.Database(certsource, (error) => {
    if (error) {
      console.error(error.message);
      throw error;
    }
    else {
        console.log("Connected to the Cert.pl SQLite database.") 
    }
})
module.exports = db, certchecker;