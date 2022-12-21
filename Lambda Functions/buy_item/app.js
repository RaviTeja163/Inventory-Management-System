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


let get_quantity = (storeID, sku) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM inventory WHERE store_id = ? AND sku = ?", [storeID, sku], (error, rows) => {
            
            if (error) { 
                return reject(error); 
            }
            
            if ((rows) && (rows.length == 1)) {
                return resolve(rows[0].quantity);
            } else if((rows) ) {
                return resolve(-1);
            }
        });
    });
}

let buy_items = (storeID, sku, quantity) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE inventory SET quantity = ? WHERE store_id = ? AND sku = ?", [quantity, storeID, sku], (error, rows) => {
            if (error) { 
                return reject(error);
            }
            return resolve(rows);
        });
    });
}

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
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
    console.log("buy_item info:" + JSON.stringify(data));
    
    try {
        var result = null;
        // var data = JSON.parse(event.body);
        let current_quantity = await get_quantity(data.store, data.sku);
        if ((current_quantity-data.purchase_num)<0){
            response.statusCode = 400;
            let err = "Not enough quantity available";
	        console.log(err);
	        response.error = err.toString();
        }
        else {
            result = await buy_items(data.store, data.sku, current_quantity-data.purchase_num);
        }
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
