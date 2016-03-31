var https = require('https');
var aws4 = require('aws4');
var api = {
    opts: {
        host: '8i4lledbrg.execute-api.us-west-2.amazonaws.com',
        headers: { 'X-API-Key': "aX2Tkqw4Bf2PGA71welOq6FSaRuTFgnf30b0ThzB",
                   'User-Agent': "BeirdoVinylCollectionApp/1.0" },
        method: "POST"
    },

    getCredentials: function(callback) {
      trySilentLogin();
      var storage = window.localStorage;
      var credentials = { 
          accessKeyId: storage.getItem('accessKeyId'),
          secretAccessKey: storage.getItem('secretKey'),
          sessionToken: storage.getItem('sessionToken')
      };
      callback(credentials);
    },
    request: function(o, callback) {
      https.request(o, callback).end(o.body || '');
    },
    pollResponse: function(id) {
      api.getCredentials(function(credentials) {
        var opts = JSON.parse(JSON.stringify(api.opts));
        opts.path = "/poll-response";
        body = JSON.stringify({ requestId: id });
        opts.headers['Content-Type'] = "application/json";
	api.request(aws4.sign(opts, function(res) {
          document.querySelector("#feedback").innerHTML = res;
          res.pipe(process.stdout);
        }));
      });
    }
}
