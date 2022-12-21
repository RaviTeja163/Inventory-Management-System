var base_url = "https://jfrgk32cxf.execute-api.us-east-1.amazonaws.com/Prod";
var local_hash = window.localStorage.getItem("session_manager");
var formData = {hash_val: local_hash};
var display_name = null;
if (local_hash !== null) {
  $.ajax({
    url: base_url+"/auth_main",
    async: false,
    type: "POST",
    data: JSON.stringify(formData),
    crossDomain: true,
    success: function (response) {
      if(String(response)[0] === "M") {
        display_name = response.substr(1, response.length); 
      }
      else {
        alert("Session expired. Please login again");
        window.location.href = "./manager_login.html"; 
      }
    },
    error: function (xhr, status) {
        alert("Error logging you in. Please login again");
        window.location.href = "./manager_login.html";
    }
  });
}
else {
  alert("Please login");
  window.location.href = "./manager_login.html"; 
}


function logout_manager(e) {
  var local_hash = window.localStorage.getItem("session_manager");
  var formData = {hash_val: local_hash};
  if (local_hash !== null) {
    window.localStorage.removeItem("session_manager");
    $.ajax({
      url: base_url+"/auth_main_logout",
      type: "POST",
      data: JSON.stringify(formData),
      crossDomain: true,
      success: function (response) {
        if(String(response) === "OK") {
          alert("Successfully logged out");
          window.location.href = "./index.html"; 
        }
      },
      error: function (xhr, status) {
          alert("Error logging out.");
      }
    });
  }
  else {
    alert("Session expired. You already logged out.");
    window.location.href = "./index.html"; 
  }
}