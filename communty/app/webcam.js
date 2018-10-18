var relationshipPhrases = ["Son", "Lover", "Ex", "Best-friend", "Child", "Cousin", "Inlaw"]

function webcamInit()
{
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

    if (navigator.getUserMedia) 
    {
        navigator.getUserMedia({ video: true }, handleVideo, videoError);
    }

    function handleVideo(stream) 
    {
        webcam.src = window.URL.createObjectURL(stream);
    }

    function videoError(e) {}
}

function drawLoop() {
    requestAnimationFrame(drawLoop);
    ctx.clearRect(0, 0, trackingCanvas.width, trackingCanvas.height);
    ctracker.draw(trackingCanvas);
}

function startTracking ()
{
    htracker = new headtrackr.Tracker({calcAngles : true, ui : false, headPosition : false});
	htracker.init(webcam, videoCanvas);
	htracker.start();
	// for each facetracking event received draw rectangle around tracked face on canvas
}


window.onkeypress = function (e) 
{
    var img = videoCanvas.toDataURL("image/jpeg");
}

var GROUP = "students";
var htracker;
var webcam;
var videoCanvas;
var trackingCanvas;
var ctx
$(function() 
{
    videoCanvas = document.getElementById("input-canvas");
    trackingCanvas = document.getElementById("tracking-canvas");
    
    trackingCanvas.setAttribute('height', document.body.clientHeight);
    trackingCanvas.setAttribute('width', document.body.clientHeight/3*4);
    ctx = trackingCanvas.getContext("2d");
    
    videoCanvas.setAttribute('height', document.body.clientHeight);
    videoCanvas.setAttribute('width', document.body.clientHeight/3*4);

    webcam = document.querySelector("#vid");
    webcam.setAttribute("width", document.body.clientHeight/3*4)
    
    document.addEventListener("facetrackingEvent", function( event ) {
	// clear canvas
	ctx.clearRect(0,0,trackingCanvas.width,trackingCanvas.height);
	// once we have stable tracking, draw rectangle
	if (event.detection == "CS") {
		ctx.translate(event.x, event.y)
		ctx.rotate(event.angle-(Math.PI/2));
		ctx.strokeStyle = "#00CC00";
		ctx.strokeRect((-(event.width/2)) >> 0, (-(event.height/2)) >> 0, event.width, event.height);
		ctx.rotate((Math.PI/2)-event.angle);
		ctx.translate(-event.x, -event.y);
	}
    });

    document.body.onkeyup = function(e){
    if(e.keyCode == 32){
        document.getElementById("nameHeader").innerHTML = chance.name().toUpperCase();
        document.getElementById("ageHeader").innerHTML = "AGE: " + chance.age();
        document.getElementById("birthdayHeader").innerHTML = "BIRTHDAY: " + chance.birthday({string: true})
        document.getElementById("relationshipHeader").innerHTML = "RELATIONSHIP: " + relationshipPhrases[Math.floor(Math.random() * relationshipPhrases.length)]
        document.getElementById("professionHeader").innerHTML = "PROFESSION: " + chance.profession();
    }
}


       
        
    
    
    
    //webcamInit();
    startTracking();
});