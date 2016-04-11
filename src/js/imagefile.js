var imagefile = {
    loadImage: function(filename, callback) {
        console.log("imagefile.loadImage");
        var rawData = '';
        window.resolveLocalFileSystemURL(filename, function(oFile) {
          oFile.file(function(readyFile) {
            var reader = new FileReader();
            reader.onloadend = function(evt) {
              callback(evt.target.result);
            };

            reader.readAsBinaryString(readyFile);
          });
        }, function(err) {
          console.log("ERROR: " + JSON.stringify(error));
          callback("", error);
        });
    },

    baseFilename: function(filename) {
        console.log("imagefile.baseFilename");
	var basename = filename.split('/').pop();
        return (basename);
    },

    deleteFile: function(filename) {
        console.log("imagefile.deleteFile");
        // Figure out how...
    }
}

module.exports = imagefile;
