$(function()
{

    //Get employees from server
    
    $.get("https://faceinthe.space:3000/get", function(data)
    {
        var employees = eval(data.employees);
        $.each(employees, function(i,name)
            {
                var elem = '<div class="employee">' +
                    '<h1>' + name + '</h1>' +
                    '<h2></h2>' +
                    '</div>';
                
                $("#employees").append(elem)
            })
    });
    


   

});