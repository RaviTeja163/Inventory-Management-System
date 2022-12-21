let response;

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


let get_store_id = (manager) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM stores WHERE manager = ?", [manager], (error, rows) => {
            if (error) { 
                return reject(error); 
            }
            
            if ((rows) && (rows.length == 1)) {
                return resolve(rows[0].store_id);
            } else {
                return reject("Store not found with manager: " + manager);
            }
        });
    });
}

let getData = (store_id) => {
    return new Promise((resolve, reject) => {
        pool.query("select items.sku as sku, item_name as item_name, quantity from stores join overstock on stores.store_id=overstock.store_id join items on items.sku = overstock.sku where stores.store_id = ?", [store_id], (error, rows) => {
            if (error) { 
                return reject(error); 
            }
            
            if ((rows) && (rows.length > 0)) {
                let result_string = "<tr> <th> SKU </th> <th> Name </th> <th> Quantity </th> </tr>";
                for(let i=0; i<rows.length; i++) {
                    result_string += "<tr> <td>"+rows[i].sku+"</td> <td>"+rows[i].item_name+"</td> <td>"+rows[i].quantity+"</td> </tr>";
                }
                return resolve(result_string);
            } 
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
        var store_id = await get_store_id(data.user_id);
        const result = await getData(store_id);
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
