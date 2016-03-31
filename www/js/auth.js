  function isAvailable() {
    window.plugins.googleplus.isAvailable(function(avail) {alert(avail)});
  }

  function login() {
    window.plugins.googleplus.login(
        { 'offline': true, 'scopes': 'profile email',
          'webClientId': '281004210608-u8qtp7kq3b0ue0hud116vis7ll5kk1r2.apps.googleusercontent.com' },
        function (obj) {
          document.querySelector("#image").src = obj.imageUrl;
          document.querySelector("#image").style.visibility = 'visible';
<!--          document.querySelector("#feedback").innerHTML = "Hi, " + obj.displayName + ", " + obj.email; -->
          document.querySelector("#feedback").innerHTML = JSON.stringify(obj);
        },
        function (msg) {
          document.querySelector("#feedback").innerHTML = "error: " + msg;
        }
    );
  }

  function trySilentLogin() {
    var storage = window.localStorage;
    var accessKeyId = storage.getItem("accessKeyId");
    var secretKey = storage.getItem("secretKey");
    var sessionToken = storage.getItem("sessionToken");
    var expiry = storage.getItem("expiry");

    if (accessKeyId && secretKey && sessionToken && expiry) {
        var expiryTime = new Date();
        expiryTime.setTime(Number(expiry));
        if (Date.now() < expiryTime) { 
            document.querySelector("#feedback").innerHTML = "Cached: " + accessKeyId;
            return;
        }
        document.querySelector("#feedback").innerHTML = "Expired: " + accessKeyId;
    }


    window.plugins.googleplus.login(
        { 'offline': true, 'scopes': 'profile email',
          'webClientId': '281004210608-u8qtp7kq3b0ue0hud116vis7ll5kk1r2.apps.googleusercontent.com' },
        function (obj) {
          document.querySelector("#image").src = obj.imageUrl;
          document.querySelector("#image").style.visibility = 'visible';
<!--          document.querySelector("#feedback").innerHTML = "Hi, " + obj.displayName + ", " + obj.email; -->
          document.querySelector("#feedback").innerHTML = JSON.stringify(obj);

          AWS.config.region = "us-east-1";
          var params = {
            IdentityPoolId: 'us-east-1:e41d9661-01a5-4afb-ba65-f47b37bedcd1',
            Logins: {
               'accounts.google.com': obj.idToken
            }
          };
          console.log(JSON.stringify(params));
          AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);
	  AWS.config.credentials.get(function(error) {
            if (error) {
              document.querySelector("#feedback").innerHTML = "Error: " + error;
              return;
            }
            var creds = AWS.config.credentials;
            document.querySelector("#feedback").innerHTML = creds.accessKeyId;
            storage.setItem("accessKeyId", creds.accessKeyId);
            storage.setItem("secretKey", creds.secretAccessKey);
            storage.setItem("sessionToken", creds.sessionToken);
            storage.setItem("expiry", creds.expireTime.getTime().toString());
            AWS.config.region = "us-west-2";
          });
        },
        function (msg) {
          document.querySelector("#feedback").innerHTML = "error: " + msg;
        }
    );
  }

  function logout() {
    window.plugins.googleplus.logout(
        function (msg) {
          document.querySelector("#image").style.visibility = 'hidden';
          document.querySelector("#feedback").innerHTML = msg;
        }
    );
  }

  function disconnect() {
    window.plugins.googleplus.disconnect(
        function (msg) {
          document.querySelector("#image").style.visibility = 'hidden';
          document.querySelector("#feedback").innerHTML = msg;
        }
    );
  }
  window.onerror = function(what, line, file) {
    alert(what + '; ' + line + '; ' + file);
  };

  function handleOpenURL (url) {
    document.querySelector("#feedback").innerHTML = "App was opened by URL: " + url;
  }


