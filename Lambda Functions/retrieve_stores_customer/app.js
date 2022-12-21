let response;

const mysql = require('mysql');
const haversine = require('haversine')

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

let getData = (current_latitude, current_longitude) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM stores", null, (error, rows) => {
            if (error) { 
                return reject(error); 
            }
    
            
            if ((rows) && (rows.length > 0)) {
                let result_array = [];
                const current_location = {
                    latitude: current_latitude,
                    longitude: current_longitude
                }
            
                let result_string = "<tr> <th> ID </th> <th> Name </th> <th> Location </th> <th> Distance </th> </tr>";
                for(let i=0; i<rows.length; i++) {
                    const store_location = {
                        latitude: rows[i].latitude,
                        longitude: rows[i].longitude
                    }
                    
                    let storeDist = haversine(current_location, store_location, {unit: 'mile'});
                    result_array[i] = [rows[i].store_id, rows[i].store_name, rows[i].latitude, rows[i].longitude, storeDist.toFixed(2)];
                }
                result_array = result_array.sort( (a,b) => a[4] - b[4]);
                for(let i=0; i<result_array.length; i++) {
                    result_string += "<tr> <td>"+result_array[i][0]+"</td> <td>"+result_array[i][1]+"</td> <td><a href='https://maps.google.com/?q="+result_array[i][2]+","+result_array[i][3]+"'>"+result_array[i][2]+", "+result_array[i][3]+"</a> </td> <td>"+result_array[i][4]+"</td> </tr>";
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
        let actual_event = event.body;
        let data = JSON.parse(actual_event);
        let current_latitude = data.latitude;
        let current_longitude = data.longitude;
        
        const result = await getData(current_latitude, current_longitude);
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
