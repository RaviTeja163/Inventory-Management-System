// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
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

// Find item

// Find Item in store can search for a given item (by SKU or Name or Description) 
// that is AVAILABLE in any store, as sorted in shortest distance to customer’s GPS.

// First search items db
// Get matching list first by sku
// Get matching list by name
// Get matching list by description
// Combine into one list 

// SKU | Name | Price | Quantity Available | Description | Store ID | Store Name | Store Location | Distance | Aisle/Shelf | Purchase Quantity

// Sort by store location
// SELECT sku FROM items WHERE sku = 'paste' OR item_name LIKE '%paste%' OR item_description LIKE '%paste%';

let findItemsSku = ( text ) => {
    var values = [[text]];
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM items WHERE sku = '" + [values] + "' OR item_name LIKE '%" + [values] + "%' OR item_description LIKE '%"+ [values] + "%'", null, (error, rows) => {
            if (error) { 
                return reject(error); 
            }
                return resolve(rows);
        });
    });
    
}


let findStoreIdBySku = ( sku ) => {
    var values = [[sku]];
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM inventory WHERE sku=?", [values], (error, rows) => {
            if (error) { 
                return reject(error); 
            }
                return resolve(rows);
        });
    });
    
}

let findStoreInfoById = ( storeId ) =>{
    var values = [[storeId]];
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM stores WHERE store_id=?", [values], (error, rows) => {
            if (error) { 
                return reject(error); 
            }
                return resolve(rows);
        });
    });
}

let findItemLocations = ( sku ) =>{
    var values = [[sku]];
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM item_locations WHERE sku=?", [values], (error, rows) => {
            if (error) { 
                return reject(error); 
            }
                return resolve(rows);
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
    console.log("find_item info:" + JSON.stringify(data));
    let current_latitude = data.latitude;
    let current_longitude = data.longitude;
    const current_location = {
        latitude: current_latitude,
        longitude: current_longitude
    }
    
    try {
        // const result = await findItemsList(data.text);
        let result_string = "<tr> <th> SKU </th> <th> Name </th> <th> Price </th> <th> Quantity Available </th> <th> Description </th> <th> Store ID </th> <th> Store Name </th> <th> Store Location </th> <th> Distance </th> <th> Aisle/Shelf </th> <th> Purchase Quantity </th>";
        if (data.text.length > 0) {

            let find_arr = [];
            let arr_index = 0;
            const itemList = await findItemsSku(data.text);
            console.log("Length of item list return: " + itemList.length);
            for(let i=0; i<itemList.length; i++) {
                console.log("item sku: " + itemList[i].sku);
                let inventoryList = await findStoreIdBySku(itemList[i].sku);
                for (let s=0; s<inventoryList.length; s++){
                    console.log("store id: " + inventoryList[s].store_id);
                    let storeList = await findStoreInfoById(inventoryList[s].store_id);
                    let itemLocations = await findItemLocations(itemList[i].sku);
                    const store_location = {
                        latitude: storeList[0].latitude,
                        longitude: storeList[0].longitude
                    }
                    let storeDist = haversine(current_location, store_location, {unit: 'mile'});
                    find_arr[arr_index] = [itemList[i].sku, itemList[i].item_name, itemList[i].price, inventoryList[s].quantity, itemList[i].item_description, inventoryList[s].store_id, storeList[0].store_name, storeList[0].latitude, storeList[0].longitude, storeDist.toFixed(2), itemLocations[0].aisle, itemLocations[0].shelf] ;
                    arr_index += 1;
                }
            }
            // To sort by column if value is numeric,
            // array.sort( (a, b) => a[1] - b[1]);
            // Sort by distance column, which is column 10
            find_arr = find_arr.sort( (a,b) => a[9] - b[9]);
            
            // let result_string = "<tr> <th> SKU </th> <th> Name </th> <th> Price </th> <th> Quantity Available </th> <th> Description </th> <th> Store ID </th> <th> Store Name </th> <th> Store Location </th> <th> Distance </th> <th> Aisle/Shelf </th> <th> Purchase Quantity </th>";
            for(let a=0; a<find_arr.length; a++){
                result_string += "<tr> <td>"+find_arr[a][0]+"</td> <td>"+find_arr[a][1]+"</td> <td> $"+find_arr[a][2]+"</td> <td>"+find_arr[a][3]+"</td> <td>"+find_arr[a][4]+"</td> <td>"+find_arr[a][5]+"</td> <td>"+find_arr[a][6]+"</td> <td><a href='https://maps.google.com/?q="+find_arr[a][7]+","+find_arr[a][8]+"'>"+find_arr[a][7]+", "+find_arr[a][8]+"</a></td> <td> " + find_arr[a][9] + " miles </td> <td> A" + find_arr[a][10] + "/S" + find_arr[a][11] + "</td> <td> <input type='text' value='0' placeholder='0'> </td> </tr>";
              }
        }
        response.statusCode = 200;
        response.body = JSON.stringify(result_string);
    } 
    catch (err) {
        response.statusCode = 400;
	    console.log(err);
	    response.error = err.toString();
    }

    return response;
};
