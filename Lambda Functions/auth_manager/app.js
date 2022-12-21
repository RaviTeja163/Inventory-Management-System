let response;
const crypto = require("crypto");
const mysql = require('mysql');

var pool = mysql.createPool({
    host: "myprojectdb.cxnobuicimua.us-east-1.rds.amazonaws.com",
    port: '3306',
    user: "admin",
    password: "admin12345",
    database: "finalprojectdb"
});


function query(conx, sql, params) {
    return new Promise((resolve, reject) => {
        conx.query(sql, params, function(err, rows) {
            if (err) {
                // reject because there was an error
                reject(err);
            } else {
                // resolve because we have result(s) from the query. it may be an empty rowset or contain multiple values
                resolve(rows);
            }
        });
    });
}

let getData = (login_id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM stores where manager=?", [login_id], (error, rows) => {
            if (error) { 
                return reject(error); 
            }
            
            if ((rows) && (rows.length == 1)) {
                return resolve(rows[0].manager_password);
            } 
        });
    });
}

let insertHash = (hash, login_id) => {
    return new Promise((resolve, reject) => {
        var values = [[login_id, hash]];
        pool.query("INSERT INTO hashes values ?", [values], (error, rows) => {
            if (error) { 
                return reject(error); 
            }
            
            return resolve("OK");
        
        });
    });
}

exports.lambdaHandler = async (event, context) => {
    response = {
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*", // Allow from anywhere
            "Access-Control-Allow-Methods": "POST" // Allow POST request
        }
    };
    
    try {
        var data = JSON.parse(event.body);
        const result = await getData(data.login_id);
        if(result === data.password) {
            var id = "M"+crypto.randomBytes(20).toString('hex');
            const result = await insertHash(id, data.login_id);
            if(result === "OK") {
                response.statusCode = 200;
                response.body = JSON.stringify(id);
            }
            else {
                response.statusCode = 400;
                console.log("Unable to store hash in database");
                response.error = "Unable to store hash in database";
            }
        }
        else {
            response.statusCode = 400;
            console.log("Invalid credentials");
            response.error = "Invalid credentials";
        }
    } 
    
    
    catch (err) {
        response.statusCode = 400;
	    console.log(err);
	    response.error = err.toString();
    }
    return response;
};
