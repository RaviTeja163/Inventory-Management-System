function generate_report(e) {
    var base_url = "https://jfrgk32cxf.execute-api.us-east-1.amazonaws.com/Prod";
    var store = document.getElementById("store_id").value;
    var display_name = document.getElementById("display_name").innerHTML;
    var formData = {store_id: parseInt(store), user_id: display_name};
    $.ajax({
      url: base_url+"/store_inventory_report",
      type: "POST",
      data: JSON.stringify(formData),
      crossDomain: true,
      success: function (response) {
        document.getElementsByTagName("table").result_table.innerHTML = response;
      },
      error: function (xhr, status) {
          document.getElementsByTagName("table").result_table.innerHTML = "";
          console.log("Error: "+status);
      }
    });
  
  
  }