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

let getItems = (store_id, aisle, shelf) => {
    return new Promise((resolve, reject) => {
        pool.query("select it.sku, it.item_name, i.quantity, it.price, it.item_description from inventory i join item_locations il on i.sku=il.sku join items it on it.sku=i.sku where il.aisle = ? and il.shelf = ? and i.store_id = ?", [aisle,shelf,store_id], (error, rows) => {
            if (error) { 
                return reject(error); 
            }
            
            if ((rows) && (rows.length > 0)) {
                let result_string = "<tr> <th> SKU </th> <th> Name </th> <th> Quantity Available </th> <th> Price </th> <th> Description </th> </tr>";
                for(let i=0; i<rows.length; i++) {
                    result_string += "<tr> <td>"+rows[i].sku+"</td> <td>"+rows[i].item_name+"</td> <td>"+rows[i].quantity+" </td> <td> $"+rows[i].price+"</td> <td>"+rows[i].item_description+"</td> </tr>";
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
        const result = await getItems(data.store_id, data.aisle, data.shelf);
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
