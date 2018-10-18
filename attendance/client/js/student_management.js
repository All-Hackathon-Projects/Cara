var name, gender, group, email, id;
var image;
var URI;

function submitFunction(){
  name = document.getElementById("nameInput").value;
  gender = document.getElementById("genderInput").value;
  group = document.getElementById("classInput").value;
  email = document.getElementById("emailInput").value;
  id = document.getElementById("idInput").value;
  
  image = document.getElementById('imageUpload').files[0];
  getBase64(image);
}
function getBase64(file) {
   var reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = function () {
     URI = reader.result;
     console.log(URI);
     //Add User
     socket.emit("addUser", {name : name, group : group, image : URI});
     alert("User Added");
   };
   reader.onerror = function (error) {
     console.log('Error: ', error);
   };
}   
var socket;
$(function()
{
    socket = io.connect();
    
});