var base_url = "https://jfrgk32cxf.execute-api.us-east-1.amazonaws.com/Prod";
$.ajax({
  url: base_url+"/retrieve_stores",
  type: "POST",
  crossDomain: true,
  success: function (response) {
      document.getElementsByTagName("table").result_table.innerHTML = response;
  },
  error: function (xhr, status) {
      console.log("Error: "+status);
  }
});

function create_store(e) {
  var store_id = document.getElementById("store_id").value;
  var store_name = document.getElementById("store_name").value;
  var latitude = document.getElementById("latitude").value;
  if (isNaN(latitude) || latitude < -90 || latitude > 90 ) {
    alert ("Latitude is Not Valid");
    console.log("Error: latitude " + latitude + " is Not Valid" )
    return;
  }
  var longitude = document.getElementById("longitude").value;
  if (isNaN(longitude) || longitude < -180 || longitude > 180 ) {
    alert ("Longitude is Not Valid");
    console.log("Error: longitude " + longitude + " is Not Valid" )
    return;
  }
  var manager = document.getElementById("manager").value;
  var password = document.getElementById("password").value;
  var formData = {store_id: parseInt(store_id), store_name: String(store_name), latitude: parseFloat(latitude), longitude: parseFloat(longitude), manager: String(manager), password: String(password)}
  $.ajax({
    url: base_url+"/create_store",
    type: "POST",
    data: JSON.stringify(formData),
    crossDomain: true,
    success: function (response) {
      alert("Store create successful.");
      location.reload();
    },
    error: function (xhr, status) {
        alert("Unable to create store. Please try again.")
        console.log("Error: "+status);
    }
  });
}