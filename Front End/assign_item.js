var base_url = "https://jfrgk32cxf.execute-api.us-east-1.amazonaws.com/Prod";
$.ajax({
  url: base_url+"/retrieve_item_locations",
  type: "POST",
  crossDomain: true,
  success: function (response) {
      document.getElementsByTagName("table").result_table.innerHTML = response;
  },
  error: function (xhr, status) {
      console.log("Error: "+status);
  }
});

function assign_item(e) {
  var sku = document.getElementById("sku").value;
  var aisle = document.getElementById("aisle").value;
  var shelf = document.getElementById("shelf").value;
  var formData = {sku: String(sku), aisle: parseInt(aisle), shelf: parseInt(shelf)};
  $.ajax({
    url: base_url+"/assign_item_location",
    type: "POST",
    data: JSON.stringify(formData),
    crossDomain: true,
    success: function (response) {
      alert("Item location assignment successful.");
      location.reload();
    },
    error: function (xhr, status) {
        alert("Unable to assign item location. Please try again.")
        console.log("Error: "+status);
    }
  });


}