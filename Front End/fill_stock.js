var base_url = "https://jfrgk32cxf.execute-api.us-east-1.amazonaws.com/Prod";

function fill(e) {
  var manager = String(document.getElementById("display_name").innerHTML);
  if(manager !== null || manager !== "") {
    var items = document.getElementById("items").value;
    items = items.trim();
    if (document.getElementById("html").checked) {
        var formData = {user_id: String(manager), all_items: "True"};
    }
    else if (document.getElementById("css").checked) {
        var formData = {user_id: String(manager), items: String(items), all_items: "False"};
    }
    else {
        alert("Please choose an option.");
        return;
    }

    $.ajax({
      url: base_url+"/fill_items",
      type: "POST",
      data: JSON.stringify(formData),
      crossDomain: true,
      success: function (response) {
        if(response === "OK") {
          document.getElementById("textfield").value = "";
          alert("Success filling shelves")
        }
        else {
          alert("Error filling shelves.");
        }
      },
      error: function (xhr, status) {
          alert("Error filling shelves. Please try again.")
          console.log("Error: "+status);
      }
    });
  }
  else {
    alert("Session expired. Please login again.")
    window.location.href = "./manager_login.html";
  }
}