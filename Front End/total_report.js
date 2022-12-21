var base_url = "https://jfrgk32cxf.execute-api.us-east-1.amazonaws.com/Prod";
var display_name = document.getElementById("display_name").innerHTML;
var formData = {user_id: display_name};
$.ajax({
  url: base_url+"/total_inventory_report",
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