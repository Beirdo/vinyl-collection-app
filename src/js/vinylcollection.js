var Api = require("api");
var _ = require('underscore');
var imagefile = require("imagefile");

var collection = {
    fileName: '',
    requestId: '',
    postPollAction: '',

    barcode: function() {
      console.log("collection.barcode");
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          alert("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format + "\n" +
                "Cancelled: " + result.cancelled);
        },
        function (error) {
          alert("Scanning failed: " + error);
        }
      );
    },

    photoSearch: function() {
        console.log("collection.photoSearch");
        navigator.camera.getPicture(function(data) {
            collection.fileName = data;
            console.log(data);
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
        console.log("collection.getPhotoRequestId");
        if (error) {
            console.log("ERROR: " + error);
            return;
        }

        if (resp.request_id) {
            collection.startPollImageResponse(resp, error);
        } else {
            // Ignore the response here, it's useless
            window.setTimeout(collection.pollPhotoRequestId, 2000);
        }
    },

    pollPhotoRequestId: function() {
        console.log("collection.pollPhotoRequestId");
        Api.pollImage(collection.fileName, false,
                      collection.getPhotoRequestId);
    },

    albumSearch: function(artist, title, release) {
        console.log("collection.albumSearch");
        Api.search(artist, title, release, collection.startPollSearchResponse);
    },

    startPollSearchResponse: function(resp, error) {
        console.log("collection.startPollSearchReponse");
        if (error) {
            console.log("ERROR: " + error);
            return;
        }

        collection.startPollResponse(resp);
    },

    startPollImageResponse: function(resp, error) {
        console.log("collection.startPollImageReponse");
        if (error) {
            console.log("ERROR: " + error);
            return;
        }

        collection.startPollResponse(resp, collection.deleteImageRequest);
    },

    startPollResponse: function(resp, postPollAction) {
        console.log("collection.startPollReponse");
	collection.requestId = resp.request_id;
        collection.postPollAction = postPollAction;
        collection.pollResponse();
    },

    pollResponse: function() {
        console.log("collection.pollReponse");
        Api.pollResponse(collection.requestId, function(resp, error) {
            if (error) {
                console.log("ERROR: " + error);
            } else if (_.isEmpty(resp)) {
                window.setTimeout(collection.pollResponse, 5000);
            } else {
                collection.displayResults(resp);
            }
        });
    },

    deleteImageRequest: function() {
        console.log("collection.deleteImageRequest");
        Api.pollImage(collection.fileName, true, collection.deletePhoto);
    },

    displayResults: function(results) {
        console.log("collection.displayResults");
        document.querySelector("#feedback").innerHTML = JSON.stringify(results);
        if (_.isFunction(collection.postPollAction)) {
            collection.postPollAction();
        }
    },
        
    deletePhoto: function(resp, error) {
        console.log("collection.deletePhoto");
        if (error) {
            console.log("ERROR: " + error);
            return;
        }

        imagefile.deleteFile(collection.fileName);
    }
};

module.exports = collection;
