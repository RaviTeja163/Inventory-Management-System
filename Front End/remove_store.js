var base_url = "https://jfrgk32cxf.execute-api.us-east-1.amazonaws.com/Prod";
var formData = {delete: "0"};
$.ajax({
  url: base_url+"/remove_store",
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

function delete_store(checkboxName) {
  var checkboxes = document.querySelectorAll('input[name="' + checkboxName + '"]:checked'), values = [];
  Array.prototype.forEach.call(checkboxes, function(el) {
        values.push(el.value);
  });

  var formData1 = {store_ids: String(values), delete: "1"};
  $.ajax({
    url: base_url+"/remove_store",
    type: "POST",
    data: JSON.stringify(formData1),
    crossDomain: true,
    success: function (response1) {
      alert("Store(s) deleted successfully.");
      location.reload();
    },
    error: function (xhr, status) {
        alert("Unable to delete store. Please try again.")
        console.log("Error: "+status);
    }
  });
}