var base_url = "https://jfrgk32cxf.execute-api.us-east-1.amazonaws.com/Prod";

function process_shipment(e) {
  var manager = String(document.getElementById("display_name").innerHTML);
  if(manager !== null || manager !== "") {
    var json = document.getElementById("textfield").value;
    var parse = JSON.parse(json);
    var json_string = "";
    for (let i =0; i<parse.shipment.length; i++) { 
        var values = Object.values(parse.shipment[i]); 
        json_string += String(values+" ");
    }
    json_string = json_string.replaceAll(",", " ");
    json_string = json_string.trim();
    var json_array = json_string.split(" ");
    for(let i=0; i<json_array.length-1; i+=2) {
      console.log(parseInt(json_array[i+1]));
      if(parseInt(json_array[i+1]) <= 0) {
        alert("The quantity should be positive (>0)");
        return;
      } 
    }
    var formData = {manager: String(manager), json_string: String(json_string)};

    $.ajax({
      url: base_url+"/process_shipment",
      type: "POST",
      data: JSON.stringify(formData),
      crossDomain: true,
      success: function (response) {
        if(response === "OK") {
          document.getElementById("textfield").value = "";
          response_string = "<tr> <th> SKU </th> <th> Quantity </th> </tr>";
          for(let i=0; i<json_array.length-1; i+=2) {
            response_string += "<tr> <td>"+json_array[i]+"</td> <td>"+json_array[i+1]+"</td> </tr>";
          }
          document.getElementById("result_table").innerHTML = response_string;
        }
        else {
          alert("Error processing shipment.");
        }
      },
      error: function (xhr, status) {
          alert("Unable to process shipment. Please try again.")
          console.log("Error: "+status);
      }
    });
  }
  else {
    alert("Session expired. Please login again.")
    window.location.href = "./manager_login.html";
  }
}

// {"shipment" : [{"item":"A1234", "quantity":"10"},{"item":"AJ123", "quantity":"15"}]}