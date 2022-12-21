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


getLocation();

function get_stores(e) {
    var base_url = "https://jfrgk32cxf.execute-api.us-east-1.amazonaws.com/Prod";
    var formData = {latitude: parseFloat(latitude), longitude: parseFloat(longitude)};
    $.ajax({
        url: base_url+"/retrieve_stores_customer",
        type: "POST",
        data: JSON.stringify(formData),
        crossDomain: true,
        success: function (response) {
            document.getElementsByTagName("table").result_table.innerHTML = response;
        },
        error: function (xhr, status) {
            console.log("Error: "+status);
        }
    });
}

