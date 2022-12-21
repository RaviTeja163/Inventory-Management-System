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