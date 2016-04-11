var request = require('request');
var _ = require('underscore');
var aws4 = require('aws4');
var Auth = require('auth');
var MD5 = require('md5');
var imagefile = require('imagefile');

var api = {
    opts: {
        host: '8i4lledbrg.execute-api.us-west-2.amazonaws.com',
        headers: { 'X-API-Key': "aX2Tkqw4Bf2PGA71welOq6FSaRuTFgnf30b0ThzB" },
        method: "POST",
        excludeContentLength: true
    },

    userAgent: "BeirdoVinylCollectionApp/1.0",
    callback: "",

    getCredentials: function(callback) {
      console.log("api.getCredentials");
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
      console.log("api.request");
      o.url = "https://" + o.host + o.path;
      api.callback = callback;
      console.log("Path: " + o.path);
      request(o, api.response);
    },

    response: function(error, response, body) {
      console.log("api.response");
      if (error) {
        console.log(JSON.stringify(e));
        if (_.isFunction(api.callback)) {
          api.callback("", e);
        }
        return;
      }

      console.log('statusCode: ' + response.statusCode);
      console.log('headers: ' + JSON.stringify(response.headers));
      console.log('body: ' + body);

      if (null == body || body == "") {
        body = "{}";
      }
      console.log("Response: " + body);
      if (_.isFunction(api.callback)) {
        api.callback(JSON.parse(body));
      }
    },

    prepare: function(path, body, type, extraHeaders, credentials) {
        console.log("api.prepare");
        var opts = JSON.parse(JSON.stringify(api.opts));
        for (var prop in extraHeaders) {
            opts.headers[prop] = extraHeaders[prop];
        }
        opts.path = "/prod" + path;
        if (type == "application/json") {
          opts.body = JSON.stringify(body);
        } else if (type == "image/jpeg") {
          opts.body = window.btoa(body);
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
      console.log("api.pollResponse");
      api.getCredentials(function(credentials, error) {
        if (error) {
          callback("", error);
        }
        var opts = api.prepare("/poll-response", {requestId: id},
                               "application/json", {}, credentials);
        console.log(JSON.stringify(opts));
	api.request(opts, callback);
      });
    },

    imageSearch: function(filename, callback) {
      console.log("api.imageSearch");
      api.getCredentials(function(credentials, error) {
        if (error) {
          callback("", error);
          return;
        }

        imagefile.loadImage(filename, function(rawData, error) {
          if (error) {
            callback("", error);
            return;
          }

          if (rawData.length == 0) {
            callback("", error);
            return;
          }

          console.log("Length: " + rawData.length);
	  var basename = imagefile.baseFilename(filename);
          var dataMD5 = MD5(rawData);
          var extraHeaders = { "Content-MD5": dataMD5 };
          var opts = api.prepare("/image-search/" + basename, rawData,
                                 "image/jpeg", extraHeaders, credentials);
          console.log(JSON.stringify(opts));
	  api.request(opts, callback);
        });
      });
    },

    pollImage: function(filename, doDelete, callback) {
      console.log("api.pollImage");
      api.getCredentials(function(credentials, error) {
        if (error) {
          callback("", error);
          return;
        }

        imagefile.loadImage(filename, function(rawData, error) {
          if (error) {
            callback("", error);
            return;
          }

	  var basename = imagefile.baseFilename(filename);
          var filesize = rawData.length;
          var params = {filename: basename, filesize: filesize,
                        delete: doDelete};
          var opts = api.prepare("/poll-image", params,
                                 "application/json", {}, credentials);
          console.log(JSON.stringify(opts));
	  api.request(opts, callback);
        });
      });
    },

    search: function(artist, title, release, callback) {
      console.log("api.search");
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
        console.log(JSON.stringify(opts));
	api.request(opts, callback);
      });
    }

}

module.exports = api;
