var https = require('https');
var aws4 = require('aws4');
var Auth = require('auth');

var api = {
    opts: {
        host: '8i4lledbrg.execute-api.us-west-2.amazonaws.com',
        headers: { 'X-API-Key': "aX2Tkqw4Bf2PGA71welOq6FSaRuTFgnf30b0ThzB" },
        method: "POST",
        excludeContentLength: true
    },

    userAgent: "BeirdoVinylCollectionApp/1.0",

    getCredentials: function(callback) {
      Auth.trySilentLogin();
      var storage = window.localStorage;
      var credentials = { 
          accessKeyId: storage.getItem('accessKeyId'),
          secretAccessKey: storage.getItem('secretKey'),
          sessionToken: storage.getItem('sessionToken')
      };
      callback(credentials);
    },

    request: function(o, callback) {
      var req = https.request(o, (res) => {
        console.log('statusCode: ' + res.statusCode);
        console.log('headers: ' + JSON.stringify(res.headers));

        res.on('data', (d) => {
          callback(d);
        });
      });

      req.on('error', (e) => {
        console.error(e);
      });

      req.write(o.body);
      req.end();
    },

    prepare: function(path, body, type, credentials) {
        var opts = JSON.parse(JSON.stringify(api.opts));
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
      
    pollResponse: function(id) {
      api.getCredentials(function(credentials) {
        var opts = api.prepare("/poll-response", {requestId: id},
                               "application/json", credentials);
	api.request(opts, function(res) {
          console.log(res);
          document.querySelector("#feedback").innerHTML = res;
        });
      });
    }
}

module.exports = api;
