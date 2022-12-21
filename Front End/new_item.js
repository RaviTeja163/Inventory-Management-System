var base_url = "https://jfrgk32cxf.execute-api.us-east-1.amazonaws.com/Prod";
$.ajax({
  url: base_url+"/retrieve_items",
  type: "POST",
  crossDomain: true,
  success: function (response) {
      document.getElementsByTagName("table").result_table.innerHTML = response;
  },
  error: function (xhr, status) {
      console.log("Error: "+status);
  }
});

function create_item(e) {
  var sku = document.getElementById("sku").value;
  var item_name = document.getElementById("item_name").value;
  var price = document.getElementById("price").value;
  if (isNaN(price) || price < 0 ) {
    alert ("Price is Not Valid");
    console.log("Error: price " + price + " is Not Valid" )
    return;
  }
  var item_description = document.getElementById("item_description").value;
  var maxQ = document.getElementById("maxQ").value;
  if (isNaN(maxQ) || maxQ < 0 ) {
    alert ("Max in shelf is Not Valid");
    console.log("Error: maxQ " + maxQ + " is Not Valid" )
    return;
  }
  var formData = {sku: String(sku), item_name: String(item_name), price: parseFloat(price).toFixed(2), item_description: String(item_description), maxQ: parseInt(maxQ)};
  $.ajax({
    url: base_url+"/create_item",
    type: "POST",
    data: JSON.stringify(formData),
    crossDomain: true,
    success: function (response) {
      alert("Item create successful.");
      location.reload();
    },
    error: function (xhr, status) {
        alert("Unable to create item. Please try again.")
        console.log("Error: "+status);
    }
  });


}