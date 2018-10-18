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


window.onclick = function (e) 
{
    var img = videoCanvas.toDataURL("image/jpeg");
    socket.emit("authenticate", {group : GROUP, image : img});
    console.log("Emitted!");
}

var GROUP = "employees";
var socket;
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

    socket = io.connect();
    socket.on("auth-result", function (data){
        console.log(data);
        if (data.result == true) {
            console.log("success")
            $("#video-overlay").animate({opacity: 0}, 0, function() {
                $(this)
                    .css({'background-image': 'url(../res/accepted.png)'})
                    .animate({opacity: 1}, 800).animate({opacity : 0}, 500);
            });
        } else {
            console.log("fail");
            $("#video-overlay").animate({opacity: 0}, 0, function() {
                $(this)
                    .css({'background-image': 'url(../res/denied.png)'})
                    .animate({opacity: 1}, 800).animate({opacity : 0}, 500);
            });
        }
    })
    
    
    //webcamInit();
    startTracking();
});