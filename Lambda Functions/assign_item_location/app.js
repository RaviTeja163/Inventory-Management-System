// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;

const mysql = require('mysql');

var pool = mysql.createPool({
    host: "myprojectdb.cxnobuicimua.us-east-1.rds.amazonaws.com",
    port: '3306',
    user: "admin",
    password: "admin12345",
    database: "finalprojectdb"
});

// https://www.freecodecamp.org/news/javascript-promise-tutorial-how-to-resolve-or-reject-promises-in-js/#:~:text=Here%20is%20an%20example%20of,message%20Something%20is%20not%20right!%20.
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

 let assignItemLocation = (item_sku, aisle_num, shelf_num ) => {
    var values = [[item_sku, aisle_num, shelf_num]];
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO item_locations values ?", [values], (error, rows) => {
            if (error) { 
                return reject(error); 
            }
                return resolve("OK");
        });
    });
}
 
exports.lambdaHandler = async (event, context) => {
    let response = {
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*", // Allow from anywhere
            "Access-Control-Allow-Methods": "POST" // Allow POST request
        }
    };

    let actual_event = event.body;
    let data = JSON.parse(actual_event);
    console.log("assign_item_location info:" + JSON.stringify(data));
    
    try {
        const result = await assignItemLocation(data.item_sku, data.aisle_num, data.shelf_num);
        response.statusCode = 200;
        response.body = JSON.stringify(result);
    } 
    catch (err) {
        response.statusCode = 400;
	    console.log(err);
	    response.error = err.toString();
    }

    return response;
};
