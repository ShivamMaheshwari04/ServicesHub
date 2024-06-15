const mysql = require("mysql");

const connection = mysql.createConnection({
    host : 'localhost',
    database : 'servicehub',
    user : 'root',
    password : 'Shivam@123',
});



module.exports = connection;