var Api = require("api");
var _ = require('underscore');

var collection = {
    fileName: '',
    requestId: '',
    postPollAction: '',
    photoSearch: function() {
        navigator.camera.getPicture(function(data) {
            collection.fileName = data;
            Api.imageSearch(data, collection.getPhotoRequestId);
          },
          function(error) {
            alert("Error: " + error);
          },
          { quality: 75, destinationType: Camera.DestinationType.FILE_URI,
            correctOrientation: true }
        );
    },

    getPhotoRequestId: function(resp, error) {
        if (error) {
            console.log("ERROR: " + error);
            return;
        }

        // Ignore the response here, it's useless
        Api.pollImage(collection.fileName, false,
                      collection.startPollImageResponse);
    },

    albumSearch: function(artist, title, release) {
        Api.search(artist, title, release, collection.startPollSearchResponse);
    },

    startPollSearchResponse: function(resp, error) {
        if (error) {
            console.log("ERROR: " + error);
            return;
        }

        collection.startPollResponse(resp);
    },

    startPollImageResponse: function(resp, error) {
        if (error) {
            console.log("ERROR: " + error);
            return;
        }

        collection.startPollResponse(resp, collection.deleteImageRequest);
    },

    startPollResponse: function(resp, postPollAction) {
	collection.requestId = resp.request_id;
        collection.postPollAction = postPollAction;
        pollResponse();
    },

    pollResponse: function() {
	var looping = false;
        Api.pollResponse(collection.requestId, function(resp, error) {
            if (error) {
                console.log("ERROR: " + error);
            } else if (_.isEmpty(resp)) {
                looping = true;
                window.setTimeout(collection.pollResponse, 5000);
            } else {
                collection.displayResults(resp);
            }
        });

        if (!looping) {
            if (_.isFunction(collection.postPollAction)) {
                collection.postPollAction();
            }
        }
    },

    deleteImageRequest: function() {
        Api.pollImage(collection.fileName, true, collection.deletePhoto);
    },

    displayResults: function(results) {
        document.querySelector("#feedback").innerHTML = JSON.stringify(results);
    },
        
    deletePhoto: function(resp, error) {
        if (error) {
            console.log("ERROR: " + error);
            return;
        }

        // Once I figure out HOW, delete the local cached photo
        // located at collection.fileName
    }
};

module.exports = collection;
