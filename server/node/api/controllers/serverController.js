//var visionAPI = require('../../../js/VisionAPI.js')
var visionAPILocation = "westcentralus"
var visionAPIKey = "f813aee777cf43d3ba21ac154f88c5e3"
const param = require('jquery-param');
var atob = require('atob');
var Blob = require("blob");
var jajax = require("jajax.js");


var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM('<html></html>');
var $ = require('jquery')(window);
var fs = require('fs');



exports.save = (req, res) =>
{
    var data = require('./data.json');
    data[req.body.key] = req.body.value;
    console.log(data);
    fs.writeFile("./api/controllers/data.json", JSON.stringify(data), (err) =>
    {
        res.send(200);
    });
    
}

exports.get = (req, res) =>
{
    res.json(require("./data.json"));
}



exports.addUser = function(req, res) {
  var name = req.body.name;
  var group = req.body.group;
  var image = req.body.image;
  init(visionAPILocation, visionAPIKey, true, function()
  {
      addPerson(group, name, function(personID)
      {
        addFace(group, personID, image, (personId) =>
        { 
             res.json({personId: personID});
        });
      })
  });
}

exports.identifyUser = function(req, res) {
  var group = req.body.group;
  var image = req.body.image;
  var personID = "";

  //console.log($);
  
  init(visionAPILocation, visionAPIKey, true, function()
  {
    analyzeFaces(image, function(data)
    {
      //If there's no face
      if(data.length == 0)
      {
          res.json({error: 1});
          return;
      }
    

      identifyFaces(group, [data[0].faceId], function(result)
      {
        var personID;
        if(result[0])
        {
            if(result[0].candidates.length > 0)
            {
                var personID = result[0].candidates[0].personId;
                res.json({person: personID, error: 0});
                return;
            }
        }
        
        res.json({error: 2});

      });
    });
  });

  
};

exports.helloWorld = (req, res) =>
{
  res.send("hello, world!");
}

//Microsoft Cognitive Services API Information
var mcs = {
  url: null,
  apiKey: null
}
//Debug mode, enales logging
var DEBUG;

//Custom log function, enabled only when in debug mode
function log(string)
{
  if(DEBUG) console.log(string);
}

/*
* Initialize the Vision API 
* Callback: no data
*/
function init(server, apiKey, debug, callback)
{
  //Formulate the API url with the appropiate server
  mcs.url = "https://" + server + ".api.cognitive.microsoft.com/face/v1.0/";
  mcs.apiKey = apiKey;
  DEBUG = debug;
  log("Successfully initialized Vision API");
  callback();
}



/*
* Analyze faces in a picture
* Returns information about the face and a unique face ID for each faces
* Callback: 
*/
function analyzeFaces(imageURI, callback)
{
  var baseApiURL = mcs.url + "detect";//"https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?";
  var params = {
      "returnFaceId": "true",
      "returnFaceLandmarks": "false",
      "returnFaceAttributes": "age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise",
  };

  $.ajax(
      {
          url: baseApiURL + "?" +  "?" + param(params),
          beforeSend: function(xhrObj)
          {
              xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
              xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", mcs.apiKey);
          },
          type: "POST",
          processData: false,
          data: makeBlob(imageURI)
      })
      .done(function(data)
      {
          log("Face analysis returned " + data.length + " people.");
          callback(data);
      })
      .fail(function(jqXHR, textStatus, errorThrown)
      {
          log("Face analysis failed: " + textStatus);
          callback([]);
      });
}

/*
* Identify the faces in a picture using a faceID
* Callback: 
*/
function identifyFaces(groupId, faceIdList, callback)
{
  var baseApiURL = mcs.url + "identify";//"https://westcentralus.api.cognitive.microsoft.com/face/v1.0/identify?";
  var params = {};
  var body = {
      "personGroupId": groupId,
      "faceIds": faceIdList,
      "maxNumOfCandidatesReturned": 1,
      "confidenceThreshold": 0.50,
  };

  $.ajax(
      {
          url: baseApiURL + "?" +  param(params),
          beforeSend: function(xhrObj)
          {
              xhrObj.setRequestHeader("Content-Type", "application/json");
              xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", mcs.apiKey);
          },
          type: "POST",
          data: JSON.stringify(body)
      })
      .done(function(data)
      {
          log("Face identification succeeded for " + faceIdList.length + " people.");
          callback(data);
      })
      .fail(function()
      {
          log("Face identification failed for " + faceIdList.length + " people.");
          callback([]);
      });
}


/**
* Create a new group
* callback: groupId
**/
function newGroup(groupId, groupName, callback)
{
  var baseApiURL = mcs.url + "persongroups" + "/" + groupId; //"https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/";
  //var params = {};

  var body = {
      "name": groupName,
      "userData": "None"
  };
  $.ajax(
      {
          url: baseApiURL, //+ param(params),
          beforeSend: function(xhrObj)
          {
              xhrObj.setRequestHeader("Content-Type", "application/json");
              xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", mcs.apiKey);
          },
          type: "PUT",
          data: JSON.stringify(body)
      })
      .done(function(data)
      {
          log("Successfully created group " + groupName + " with id " + groupId);
          callback(groupId);
      })
      .fail(function()
      {
          log("Failed to create group " + groupName + " with id " + groupId);
          callback(null);
      });
}

/**
* Add a person to a group
* callback: personId
**/
function addPerson(groupId, personName, callback)
{
  var baseApiURL = mcs.url + "persongroups" + "/" + groupId + "/" + "persons";//"https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/";
  var params = {};
  var body = {
      "name": personName,
      "userData": "None",
  };

  $.ajax(
      {
          url: baseApiURL + "?" + param(params),
          beforeSend: function(xhrObj)
          {
              xhrObj.setRequestHeader("Content-Type", "application/json");
              xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", mcs.apiKey);
          },
          type: "POST",
          data: JSON.stringify(body)
      })
      .done(function(data)
      {
          log("Successfully added person " + personName + " with id " + data["personId"] + " to group " + groupId);
          callback(data["personId"]);
      })
      .fail(function()
      {
          log("Failed to add person " + personName + " to group " + groupId);
          callback(null);
      });
}

/**
* Attach a face to a person
* callback: persistedFaceId
**/
function addFace(groupId, personId, imageURI, callback)
{
  var baseApiURL = mcs.url + "persongroups" + "/" + groupId + "/" +  "persons" + "/" + personId + "/" + "persistedFaces";//"https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/";
  var params = {};

  $.ajax(
      {
          url: baseApiURL + "?" + param(params),
          beforeSend: function(xhrObj)
          {
              xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
              xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", mcs.apiKey);
          },
          type: "POST",
          data: makeBlob(imageURI),
          processData: false
      })
      .done(function(data)
      {
          log("Successfully added face with persistent id " + data["persistedFaceId"] + " to person " + personId + " in group " + groupId);
          //Automatically train a group when a new face is added
          trainGroup(groupId, function(groupId)
          {
              //log("Successfuly re-trained the group.");
              callback(data["persistedFaceId"]);
          });

          
      })
      .fail(function()
      {
          log("Failed adding face to person " + personId + " in group " + groupId);
          callback(null);
      });
}

/**
* Update a group when new faces are added
* Callback data: groupId
**/
function trainGroup(groupId, callback)
{
  var baseApiURL = mcs.url + "persongroups" + "/" + groupId + "/" + "train";//"https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/";
  var params = {};
  var body = {};

  $.ajax(
      {
          url: baseApiURL + "?" + param(params),
          beforeSend: function(xhrObj)
          {
              xhrObj.setRequestHeader("Content-Type", "application/json");
              xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", mcs.apiKey);
          },
          type: "POST",
          data: JSON.stringify(body)
      })
      .done(function(data)
      {
          log("Successfully trained group " + groupId);
          callback(groupId);
      })
      .fail(function()
      {
          log("Failed to train group " + groupId);
          callback(null);
      });
}


function makeBlob(dataURI)
{

  var buffer = new Buffer(dataURI.split(",")[1], 'base64');
  return buffer;

  return b;
 /* var BASE64_MARKER = ';base64,';
  if (dataURI.indexOf(BASE64_MARKER) == -1)
  {
      var parts = dataURI.split(',');
      var contentType = parts[0].split(':')[1];
      var raw = decodeURIComponent(parts[1]);
      return new Blob([raw],
      {
          type: contentType
      });
  }
  var parts = dataURI.split(BASE64_MARKER);
  var contentType = parts[0].split(':')[1];
  var raw = atob(parts[1]);
  var rawLength = raw.length;

  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i)
  {
      uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array],
  {
      type: contentType
  });*/
}