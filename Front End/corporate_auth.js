var base_url = "https://jfrgk32cxf.execute-api.us-east-1.amazonaws.com/Prod";
var local_hash = window.localStorage.getItem("session_corporate");
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
      if(String(response)[0] === "C") {
        display_name = response.substr(1, response.length); 
      }
      else {
        alert("Session expired. Please login again");
        window.location.href = "./corporate_login.html"; 
      }
    },
    error: function (xhr, status) {
        alert("Error logging you in. Please login again");
        window.location.href = "./corporate_login.html";
    }
  });
}
else {
  alert("Please login");
  window.location.href = "./corporate_login.html"; 
}

function logout_corporate(e) {
  var local_hash = window.localStorage.getItem("session_corporate");
  var formData = {hash_val: local_hash};
  if (local_hash !== null) {
    window.localStorage.removeItem("session_corporate");
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