var employees;
function main()
{
    //Get employees from server
    
    $.get("https://faceinthe.space:3000/get", function(data)
    {
        employees = eval(data.employees);
        render();
    });
    
    //Sockets
    var socket = io.connect();
    socket.on('auth-result', function(data) {
          console.log(data);
          if(data.error == 1) 
          {
            console.log("no face");
          }
          if(data.error == 2) 
          {
            console.log("face not recognized");
            if(confirm("add new user?"))
            {
              var str = prompt("name?");
              socket.emit("addUser", {name : str});
            }
          }
          else if(data.person)
          {
            console.log(data.person)

            

            //Add time card to employee
            for(var i = 0; i < employees.length; i++)
            {
                if(employees[i].id == data.person)
                {
                    var tc = employees[i].timeCard;
                    if(tc.length == 0)
                    {
                       tc.push(getTime());
                       $("#" + data.person).css('backgroundColor', "#49b136")
                    }
                    else if(tc.length == 1)
                    {
                        tc.push(getTime());
                        $("#" + data.person).css('backgroundColor', "#eeeeee")
                    }
                    else
                    {
                        tc.pop();
                        tc.pop();
                        tc.push(getTime());
                        $("#" + data.person).css('backgroundColor', "#49b136")
                    }
                }
            }
            render();
            update();
            

          } else {
            console.log("nothing inside");
          }
    });
    socket.on('addedUser', function(data)
    {
        console.log("new employee with name " + data.name + "and id " + data.id);

        employees.push({name: data.name, id: data.id});

        
        update();
        render();
        

    });



   

}

function update()
{
    $.post("https://faceinthe.space:3000/save",
        {key: "employees", value: JSON.stringify(employees)});
}

function getTime()
{
    var d = new Date();
    return ("" + d.getHours()) + ":" + ((d.getMinutes()) >= 10 ? d.getMinutes() : "0" +d.getMinutes());
}

$(function(){main();});

function render()
{
    $("#employees").empty();
    $.each(employees, function(i,emp)
            {
                var green;

                if(!emp.timeCard) emp.timeCard = [];

                var time;
                if(emp.timeCard.length == 0) 
                {
                    time = "";
                }
                else if(emp.timeCard.length == 1)
                {
                    green = true;
                    time = "<h2>" + emp.timeCard[0] + "</h2>";
                }
                else
                {
                    time = "<h2>" + emp.timeCard[0] + " - " + emp.timeCard[1] + "</h2>";
                }

                var elem = '<div class="employee" id=' + emp.id + '>' +
                    '<h1>' + emp.name + '</h1>' +
                     time +
                    '</div>';
                
                $("#employees").append(elem)
                if(green) $("#" + emp.id).css('backgroundColor', "#49b136")
            })
}