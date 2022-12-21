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

let get_all_items = (store_id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM inventory WHERE store_id = ?", [store_id], (error, rows) => {
            if (error) { 
                return reject(error); 
            }
            
            if ((rows) && (rows.length > 0)) {
                var all_items = [];
                for(let i=0; i<rows.length; i++) {
                    all_items.push(rows[i].sku)
                }
                return resolve(all_items);
            } 
            else {
                return reject("No inventory found for the store.");
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

let fill_shelves = (storeID, sku, maxQ, currQ, currOverstockQ) => {
    var quantity_inventory = Math.min(currQ+currOverstockQ, maxQ);
    var quantity_overstock = currQ+currOverstockQ-quantity_inventory;
    return new Promise((resolve, reject) => {
        pool.query("UPDATE inventory SET quantity = ? WHERE store_id = ? AND sku = ?", [quantity_inventory, storeID, sku], (error, rows) => {
            if (error) { 
                return reject(error); 
            }
            pool.query("UPDATE overstock SET quantity = ? WHERE store_id = ? AND sku = ?", [quantity_overstock, storeID, sku], (error, rows) => {
                if (error) { 
                    return reject(error); 
                }
                // if ((rows) && (rows.length > 0)) {
                    return resolve("OK");
                // } 
            }); 
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
        var items_array = null
        if (data.all_items === "True") {
            items_array = await get_all_items(store_id);
        }
        else if (data.all_items === "False") {
            items_array = data.items.split(",");
        }
        for(let i=0; i<items_array.length; i+=1) {
            var sku = items_array[i];
            var max_quantity = await get_max(sku);
            var current_quantity = await get_current(store_id, sku);
            var current_overstock_quantity = await get_current_overstock(store_id, sku);
            var result = await fill_shelves(store_id, sku, max_quantity, current_quantity, current_overstock_quantity);
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
