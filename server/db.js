const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'insaynitea_db'
});


connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    } else {
        console.log('Connected to the MySQL database!');
    }
});

module.exports = connection;