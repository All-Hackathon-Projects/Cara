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
this.init = function(server, apiKey, debug, callback)
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
this.analyzeFaces = function(imageURI, callback)
{
    var baseApiURL = mcs.url + "detect";//"https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?";
    var params = {
        "returnFaceId": "true",
        "returnFaceLandmarks": "false",
        "returnFaceAttributes": "age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise",
    };

    $.ajax(
        {
            url: baseApiURL + "?" +  "?" + $.param(params),
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
this.identifyFaces = function(groupId, faceIdList, callback)
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
            url: baseApiURL + "?" +  $.param(params),
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
this.newGroup = function(groupId, groupName, callback)
{
    var baseApiURL = mcs.url + "persongroups" + "/" + groupId; //"https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/";
    //var params = {};

    var body = {
        "name": groupName,
        "userData": "None"
    };
    $.ajax(
        {
            url: baseApiURL, //+ $.param(params),
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
this.addPerson = function(groupId, personName, callback)
{
    var baseApiURL = mcs.url + "persongroups" + "/" + groupId + "/" + "persons";//"https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/";
    var params = {};
    var body = {
        "name": personName,
        "userData": "None",
    };

    $.ajax(
        {
            url: baseApiURL + "?" + $.param(params),
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
this.addFace = function(groupId, personId, imageURI, callback)
{
    var baseApiURL = mcs.url + "persongroups" + "/" + groupId + "/" +  "persons" + "/" + personId + "/" + "persistedFaces";//"https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/";
    var params = {};

    $.ajax(
        {
            url: baseApiURL + "?" + $.param(params),
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
this.trainGroup = function(groupId, callback)
{
    var baseApiURL = mcs.url + "persongroups" + "/" + groupId + "/" + "train";//"https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/";
    var params = {};
    var body = {};

    $.ajax(
        {
            url: baseApiURL + "?" + $.param(params),
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
    var BASE64_MARKER = ';base64,';
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
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i)
    {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array],
    {
        type: contentType
    });
}