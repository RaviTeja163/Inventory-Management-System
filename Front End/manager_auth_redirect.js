var base_url = "https://jfrgk32cxf.execute-api.us-east-1.amazonaws.com/Prod";
var local_hash = window.sessionStorage.getItem("session_manager");
var formData = {hash_val: local_hash};
if (local_hash !== null) {
  $.ajax({
    url: base_url+"/auth_main",
    async: false,
    type: "POST",
    data: JSON.stringify(formData),
    crossDomain: true,
    success: function (response) {
      if(String(response)[0] === "M") {
        window.location.href = "./manager_home.html";
      }
    }
  });
}