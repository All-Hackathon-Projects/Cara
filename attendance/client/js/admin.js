var storage = {
};
var i = 0;
var r = 0;
function addUserToTable (person, personId) 
{
    var firstRow=document.getElementById("roster").rows[r];
    var x=firstRow.insertCell(-1);
    x.id = personId;
    x.innerHTML=" ";
    
    var image = document.createElement("img");
    image.src = person.image;
    image.width = 120;
    image.height = 90;
    x.appendChild(image);
    x.innerHTML += "\t" + person.name

    if(++i%4==0) r += 1;
    
}
$(function()
{
    for (var personId in storage)
    {
        var person = storage[personId];
        addUserToTable(person, personId);
    }

    var socket = io.connect("https://faceinthe.space:5000");
    socket.on('auth-result', function(data)
    {
        console.log(data);
        if (data.error == 1)
        {
            console.log("no face");
        }
        if (data.error == 2)
        {
            console.log("Face not recognized");
            if (confirm("Add new user?"))
            {
                var str = prompt("Name?");
                socket.emit("addUser",
                {
                    name: str
                });
                
            }
        }
        else if (data.person)
        {
            var selector = "#" + data.person;
            $(selector).css("background-color", "#00ff00")
        }
        else
        {
            console.log("nothing inside");
        }
    });
    socket.on("addedUser", function (data){
        console.log(data);
        addUserToTable(data, data.person);
    });
});