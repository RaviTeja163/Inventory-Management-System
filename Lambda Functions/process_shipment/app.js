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

let get_max = (sku) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM items WHERE sku = ?", [sku], (error, rows) => {
            if (error) { 
                return reject(error); 
            }
            
            if ((rows) && (rows.length == 1)) {
                return resolve(rows[0].maxQ);
            } else {
                return reject("Item not found with sku: " + sku);
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

let get_current = (storeID, sku) => {
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

let get_current_overstock = (storeID, sku) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM overstock WHERE store_id = ? AND sku = ?", [storeID, sku], (error, rows) => {
            if (error) { 
                return reject(error); 
            }
            
            if ((rows) && (rows.length == 1)) {
                return resolve(rows[0].quantity);
            } else {
                return resolve(-1);
            }
        });
    });
}


let process_shipment_insert = (storeID, sku, quantity, maxQ) => {
    var quantity_inventory = Math.min(quantity, maxQ);
    var quantity_overstock = quantity-quantity_inventory;
            return new Promise((resolve, reject) => {
                var values = [[storeID, sku, quantity_inventory]];
                pool.query("INSERT INTO inventory values ?", [values], (error, rows) => {
                    if (error) { 
                        return reject(error); 
                    }
                    var values = [[storeID, sku, quantity_overstock]];
                    pool.query("INSERT INTO overstock values ?", [values], (error, rows) => {
                    if (error) { 
                        return reject(error); 
                    }
                    
                    // if ((rows) && (rows.length > 0)) {
                        return resolve("OK");
                    // } 
                    });
                    // if ((rows) && (rows.length > 0)) {                    // } 
                });
            });
        } 
        
let process_shipment_update = (storeID, sku, quantity, maxQ, currQ, currOverstockQ) => {
    var quantity_inventory = Math.min(quantity, maxQ-currQ);
    var quantity_overstock = quantity-quantity_inventory;
            return new Promise((resolve, reject) => {;
                pool.query("UPDATE inventory SET quantity = ? WHERE store_id = ? AND sku = ?", [quantity_inventory+currQ, storeID, sku], (error, rows) => {
                    if (error) { 
                        return reject(error); 
                    }
                    if (quantity_overstock > 0) {
                        pool.query("UPDATE overstock SET quantity = ? WHERE store_id = ? AND sku = ?", [quantity_overstock+currOverstockQ, storeID, sku], (error, rows) => {
                        if (error) { 
                            return reject(error); 
                        }
                        
                        // if ((rows) && (rows.length > 0)) {
                            return resolve("OK");
                        // } 
                        });
                    }
                    else {
                        return resolve("OK");
                    }
                    // if ((rows) && (rows.length > 0)) {                    // } 
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
        var result = null;
        var data = JSON.parse(event.body);
        var storeID = await get_store_id(data.manager);
        
        var json_array = data.json_string.split(" ");
        for(let i=0; i<json_array.length-1; i+=2) {
            var sku = json_array[i];
            var quantity = json_array[i+1];
            var max_quantity = await get_max(sku);
            var current_quantity = await get_current(storeID, sku);
            if(current_quantity == -1) {
                result = await process_shipment_insert(storeID, sku, quantity, max_quantity);
            }
            else if(current_quantity >= 0) {
                var current_overstock_quantity = await get_current_overstock(storeID, sku);
                result = await process_shipment_update(storeID, sku, quantity, max_quantity, current_quantity, current_overstock_quantity);
            }
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