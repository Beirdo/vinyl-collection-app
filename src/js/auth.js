var AWS = require('aws-sdk')

var authFuncs = {
  errorCallback: function(error) { },

  login: function(callback) {
    var storage = window.localStorage;
    var accessKeyId = storage.getItem("accessKeyId");
    var secretKey = storage.getItem("secretKey");
    var sessionToken = storage.getItem("sessionToken");
    var expiry = storage.getItem("expiry");

    authFuncs.errorCallback = callback;

    if (accessKeyId && secretKey && sessionToken && expiry) {
        var expiryTime = new Date();
        expiryTime.setTime(Number(expiry));
        if (Date.now() < expiryTime) {
            document.querySelector("#feedback").innerHTML = "Cached: " + accessKeyId;
            callback();
            return;
        }
        document.querySelector("#feedback").innerHTML = "Expired: " + accessKeyId;
    }

    var googleParams = {
      'offline': true, 'scopes': 'profile email',
      'webClientId': '281004210608-u8qtp7kq3b0ue0hud116vis7ll5kk1r2.apps.googleusercontent.com'
    };

    window.plugins.googleplus.login(googleParams, authFuncs.googleCallback,
                                    callback);
  },

  googleCallback: function (obj) {
    document.querySelector("#image").src = obj.imageUrl;
    document.querySelector("#image").style.visibility = 'visible';
    document.querySelector("#feedback").innerHTML = JSON.stringify(obj);

    var storage = window.localStorage;
    storage.setItem("username", obj.displayName);
    storage.setItem("email", obj.email);

    AWS.config.region = "us-east-1";
    var awsParams = {
      IdentityPoolId: 'us-east-1:e41d9661-01a5-4afb-ba65-f47b37bedcd1',
      Logins: { 'accounts.google.com': obj.idToken }
    };
    console.log(JSON.stringify(awsParams));
    AWS.config.credentials = new AWS.CognitoIdentityCredentials(awsParams);
    AWS.config.credentials.get(authFuncs.awsCallback);
  },

  awsCallback: function(error) {
    if (error) {
      authFuncs.errorCallback(error);
      return;
    }

    var storage = window.localStorage;
    var creds = AWS.config.credentials;
    document.querySelector("#feedback").innerHTML = creds.accessKeyId;
    storage.setItem("accessKeyId", creds.accessKeyId);
    storage.setItem("secretKey", creds.secretAccessKey);
    storage.setItem("sessionToken", creds.sessionToken);
    storage.setItem("expiry", creds.expireTime.getTime().toString());
    AWS.config.region = "us-west-2";
    authFuncs.errorCallback();
  },

  logout: function() {
    window.plugins.googleplus.logout(
        function (msg) {
          document.querySelector("#image").style.visibility = 'hidden';
          document.querySelector("#feedback").innerHTML = msg;
        }
    );
  },

  disconnect: function() {
    window.plugins.googleplus.disconnect(
        function (msg) {
          document.querySelector("#image").style.visibility = 'hidden';
          document.querySelector("#feedback").innerHTML = msg;
        }
    );
  }
};

module.exports = authFuncs;

window.onerror = function(what, line, file) {
    alert(what + '; ' + line + '; ' + file);
};


