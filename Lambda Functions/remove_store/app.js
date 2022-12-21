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

let getData = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM stores", null, (error, rows) => {
            if (error) { 
                return reject(error); 
            }
            
            if ((rows) && (rows.length > 0)) {
                let result_string = "<tr> <td> </td> <th> ID </th> <th> Name </th> <th> Location </th> <th> Manager </th> </tr>";
                for(let i=0; i<rows.length; i++) {
                    result_string += "<tr> <td> <input type=\"checkbox\" name=\"store\" value="+rows[i].store_id+"> </td> <td>"+rows[i].store_id+"</td> <td>"+rows[i].store_name+"</td> <td><a href='https://maps.google.com/?q="+rows[i].latitude+","+rows[i].longitude+"'>"+rows[i].latitude+", "+rows[i].longitude+"</a> </td> <td>"+rows[i].manager+"</td> </tr>";
                }
                return resolve(result_string);
            } 
        });
    });
}

let removeStore = (store_id) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM inventory WHERE store_id = ?", [store_id], (error, rows) => {
            if (error) { 
                return reject(error); 
            }
            pool.query("DELETE FROM overstock WHERE store_id = ?", [store_id], (error, rows) => {
                if (error) { 
                    return reject(error); 
                }
                pool.query("DELETE FROM stores WHERE store_id = ?", [store_id], (error, rows) => {
                    if (error) { 
                        return reject(error); 
                    }
                    
                    // if ((rows) && (rows.length > 0)) {
                        return resolve("OK");
                    // } 
                });
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
        var result = null;
        if (data.delete === "1"){
            var id_array = data.store_ids.split(",");
            for(let i=0; i<id_array.length; i+=1) {
                var storeID = id_array[i];
                result = await removeStore(parseInt(storeID));
            }
        } else if (data.delete === "0") {
            result = await getData();
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
