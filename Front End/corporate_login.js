var base_url = "https://jfrgk32cxf.execute-api.us-east-1.amazonaws.com/Prod";
function auth_corporate(e) {
  var login_id = document.getElementById("login_id").value;
  var password = document.getElementById("password").value;
  var formData = {login_id: String(login_id).trimEnd(), password: String(password)}
  $.ajax({
    url: base_url+"/auth_corporate",
    type: "POST",
    data: JSON.stringify(formData),
    crossDomain: true,
    success: function (response) {
      window.localStorage.setItem("session_corporate", String(response));
      window.location.href = "./corporate_home.html";
    },
    error: function (xhr, status) {
        alert("Unable to login. Please check credentials.")
        console.log("Error: "+status);
    }
  });
}
