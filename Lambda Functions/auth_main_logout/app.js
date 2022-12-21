let response;

const mysql = require('mysql');
const crypto = require("crypto");

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

let logoutUser = (hash) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM hashes where hash_val=?", [hash], (error, rows) => {
            if (error) { 
                return reject(error); 
            }
            return resolve("OK");
        });
    });
};


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
        const result = await logoutUser(data.hash_val);
        if(result) {
           response.statusCode = 200;
           response.body = JSON.stringify(result);
        }
        else {
            response.statusCode = 400;
            console.log("Unable to logout");
            response.error = "Unable to logout";
        }
    } 
    
    
    catch (err) {
        response.statusCode = 400;
	    console.log(err);
	    response.error = err.toString();
    }
    return response;
};
