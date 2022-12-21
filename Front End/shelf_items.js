function list_items(e) {
    var base_url = "https://jfrgk32cxf.execute-api.us-east-1.amazonaws.com/Prod";
    var store = document.getElementById("store_id").value;
    var aisle_num = document.getElementById("aisle").value;
    var shelf_num = document.getElementById("shelf").value;
    var formData = {store_id: parseInt(store), aisle: parseInt(aisle_num), shelf: parseInt(shelf_num)};
    $.ajax({
      url: base_url+"/list_items_on_shelf",
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