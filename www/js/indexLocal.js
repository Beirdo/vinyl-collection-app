function onSignIn(googleUser) {
    console.log('on signin' + JSON.stringify(googleUser, undefined, 2));
    var response = googleUser.getAuthResponse();
    if (response.status.signed_in) {
        document.getElementById('signed-in-cell').innerText = "Signed In";
        var id_token = response.id_token;

        AWS.config.region = "us-east-1";
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:e41d9661-01a5-4afb-ba65-f47b37bedcd1',
            Logins: {
                'accounts.google.com': id_token
            }
        });
        AWS.config.credentials.get(function() {
            var accessKeyId = AWS.config.credentials.accessKeyId;
            var secretAccessKey = AWS.config.credentials.secretAccessKey;
            var sessionToken = AWS.config.credentials.sessionToken;

            document.getElementById('curr-user-cell').innerText = accessKeyId;
        });
    }
}
