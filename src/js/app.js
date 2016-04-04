
var React = require("react");
var ReactDOM = require("react-dom");
var HomeComponents = require("home/homeComponents");
var VinylCollection = require("vinylcollection");

var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        console.log("Device ready, will try to render React component!");

        var mountNode = document.getElementById('reactAppContainer');
        var mountComponent = React.createElement(HomeComponents.Home, {
            name: window.localStorage.getItem("username")
        });
        ReactDOM.render(mountComponent, mountNode);
        console.log("React should now be loaded");
    },

    photoSearch: function() {
	VinylCollection.photoSearch();
    },

    albumSearch: function(album, title, release) {
        VinylCollection.albumSearch(album, title, release);
    }
};

app.initialize();

