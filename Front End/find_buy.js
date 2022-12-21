var loc = document.getElementById("location");
var latitude = 0;
var longitude = 0;

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, positionError);
    } else {
        loc.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    loc.innerHTML = "Your location is Latitude: " + latitude + " Longitude: " + longitude;
}

function positionError(error) {
    console.log ("Position Error: " + error);
    latitude = 0;
    longitude = 0;
    loc.innerHTML = "Your location is Latitude: " + latitude + " Longitude: " + longitude;
}

$(document).ready( function () {
    getLocation();
});

function generate_item_list(e) {
    var base_url = "https://jfrgk32cxf.execute-api.us-east-1.amazonaws.com/Prod";
    var searchText = document.getElementById("search_text").value;
    var formData = {text: String(searchText).trimEnd(), latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
    console.log("formData: " + formData);
    $.ajax({
        url: base_url+"/find_item",
        type: "POST",
        data: JSON.stringify(formData),
        crossDomain: true,
        success: function (response) {
            console.log("Response: "+response );
            document.getElementsByTagName("table").result_table.innerHTML = response;
        },
        error: function (xhr, status) {
            console.log("Error: "+status);
        }
    });

}

function buy_items(e) {
    var base_url = "https://jfrgk32cxf.execute-api.us-east-1.amazonaws.com/Prod";
    // var result_table = document.getElementsByTagName("table").result_table.innerHTML;
    var dataTable = document.getElementById("item_table");
    console.log("item_table: "+ dataTable);
    // var data_rows = dataTable.querySelectorAll("tr");
    // var formData = {purchase_list: []};
    for (var i = 1; i < dataTable.rows.length; i+=1) {
        // GET THE CELLS COLLECTION OF THE CURRENT ROW.
        var itemCells = dataTable.rows.item(i).cells;
        let item_sku = itemCells.item(0).innerHTML;
        let item_store = itemCells.item(5).innerHTML;
        let purchase_quantity = itemCells.item(10).getElementsByTagName('input')[0].value;
        // console.log("buy item " + i + " sku " + item_sku + " store " + item_store + " quantity " + purchase_quantity);
        if (purchase_quantity <= 0){
            continue;
        }
        var formData = {sku: String(item_sku), store: String(item_store), purchase_num: parseFloat(purchase_quantity) };
        // console.log("buy item " + i + ": " + formData);
        console.log("buy item " + i + " sku " + item_sku + " store " + item_store + " quantity " + purchase_quantity);
        $.ajax({
            url: base_url+"/buy_item",
            type: "POST",
            data: JSON.stringify(formData),
            crossDomain: true,
            success: function (response) {
                console.log("Response: "+response );
                generate_item_list(e);
                // document.getElementsByTagName("table").result_table.innerHTML = response;
            },
            error: function (xhr, status) {
                alert("Unable to purchase item(s). Please try again.")
                console.log("Error: "+status);
            }
        });
    }
}
