var https = require('https');
var aws4 = require('aws4');
var Auth = require('auth');
var MD5 = require('md5');

var api = {
    opts: {
        host: '8i4lledbrg.execute-api.us-west-2.amazonaws.com',
        headers: { 'X-API-Key': "aX2Tkqw4Bf2PGA71welOq6FSaRuTFgnf30b0ThzB" },
        method: "POST",
        excludeContentLength: true
    },

    userAgent: "BeirdoVinylCollectionApp/1.0",

    getCredentials: function(callback) {
      Auth.login(function(error) {
        if (error) {
          callback({}, error);
          return;
        }

        var storage = window.localStorage;
        var credentials = {
          accessKeyId: storage.getItem('accessKeyId'),
          secretAccessKey: storage.getItem('secretKey'),
          sessionToken: storage.getItem('sessionToken')
        };
        console.log(JSON.stringify(credentials));
        callback(credentials);
      });
    },

    request: function(o, callback) {
      var req = https.request(o, (res) => {
        console.log('statusCode: ' + res.statusCode);
        console.log('headers: ' + JSON.stringify(res.headers));

        res.on('data', (d) => {
          callback(JSON.parse(d));
        });
      });

      req.on('error', (e) => {
        console.error(e);
      });

      req.write(o.body);
      req.end();
    },

    prepare: function(path, body, type, extraHeaders, credentials) {
        var opts = JSON.parse(JSON.stringify(api.opts));
        for (var prop in extraHeaders) {
            opts.headers[prop] = extraHeaders[prop];
        }
        opts.path = "/prod" + path;
        if (type == "application/json") {
          opts.body = JSON.stringify(body);
        } else if (type == "image/jpeg") {
          // not supported yet, but need to base64 encode the JPEG
        } else {
          opts.body = body;
        }
        opts.headers['Content-Type'] = type;
        console.log(JSON.stringify(opts));
        var signed = aws4.sign(opts, credentials);
        console.log(JSON.stringify(signed));
        signed.headers['User-Agent'] = api.userAgent;
        return signed;
    },

    pollResponse: function(id, callback) {
      api.getCredentials(function(credentials, error) {
        if (error) {
          callback("", error);
        }
        var opts = api.prepare("/poll-response", {requestId: id},
                               "application/json", {}, credentials);
	api.request(opts, callback);
      });
    },

    imageSearch: function(filename, callback) {
      api.getCredentials(function(credentials, error) {
        console.log("got here " + callback);
        console.log("error " + error);
        if (error) {
          callback("", error);
        }

        var rawData = '';
        console.log("resolve: " + window.resolveLocalFileSystemURI);
        window.resolveLocalFileSystemURI(filename, function(oFile) {
          console.log("resolved to: " + oFile);
          oFile.file(function(readyFile) {
            console.log("readyFile: " + readyFile);
            var reader = new FileReader();
            reader.onloadend = function(evt) {
              console.log("Event: " + evt);
              rawData = evt.target.result;
            };

            reader.readAsArrayBuffer(readyFile);
          });
        }, function(err) {
          console.log("ERROR: " + JSON.stringify(error));
        });

        if (rawData.length() == 0) {
          return;
        }

	var basename = filename.split('/').pop();
        var dataMD5 = MD5(rawData);
        var base64data = window.btoa(rawData);
        var extraHeaders = { "Content-MD5": dataMD5 };
        var opts = api.prepare("/image-search/" + basename, base64data,
                               "image/jpeg", extraHeaders, credentials);
        console.log(JSON.stringify(opts));
	api.request(opts, callback);
      });
    },

    pollImage: function(filename, doDelete, callback) {
      api.getCredentials(function(credentials, error) {
        if (error) {
          callback("", error);
        }

        window.resolveLocalFileSystemURL(filename, function(oFile) {
          oFile.file(function(readyFile) {
            var reader = new FileReader();
            reader.onloadend = function(evt) {
              rawData = evt.target.result;
            };

            reader.readAsArrayBuffer(readyFile);
          });
        }, function(err) {
          console.log("ERROR: " + JSON.stringify(error));
        });

	var basename = filename.split('/').pop();
        var filesize = rawData.length();
        var params = {filename: basename, filesize: filesize, delete: doDelete};
        var opts = api.prepare("/poll-image", params,
                               "application/json", {}, credentials);
	api.request(opts, callback);
      });
    },

    search: function(artist, title, release, callback) {
      api.getCredentials(function(credentials, error) {
        if (error) {
          callback("", error);
        }
        var params = {};
        if (artist) {
           params.artist = artist;
        }
        if (title) {
           params.title = title;
        }
        if (release) {
           params.release = release;
        }
        var opts = api.prepare("/search", params,
                               "application/json", {}, credentials);
	api.request(opts, callback);
      });
    }

}

module.exports = api;
