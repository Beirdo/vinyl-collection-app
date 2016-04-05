/** @jsx React.DOM */

var React = require("react");
var ReactDOM = require("react-dom");
var $ = require("jquery");
var _ = require("underscore");
var VinylCollection = require('vinylcollection');

var Footer = require("common/commonComponents").Footer;

var Content = React.createClass({

      // Just to show it's possible to manipulate DOM with JQuery inside React
      componentDidMount: function() {
        var self = this;
        var counter = 0;
//        setInterval(function() {
//            counter++;
 //           $(self.refs)
  //            .find(".jqueryUptadable")
   //           .text("Updated by JQuery! -> "+counter);
    //    },1000);
        console.debug("interval set");

      },

      render: function() {
        return (
            <div className="reactComponentContainer">
                    <h1>Hello {this.props.name}</h1>
                    <p>This is rendered with a React JSX Component! yeah2</p>
                    <div>
                        <img src="img/logo.png"/>
                    </div>
                    <div className="jqueryUptadable">
                        This should be updated soon by JQuery
                    </div>
            </div>
        );
      }

});

var Home = React.createClass({
      render: function() {
        imgStyle = {
            position: 'absolute',
            top: '10px',
            left: '10px'
        };
        return (
            <div className="reactComponentContainer">
               <Content name={this.props.name}/>
               <img id="image" style={imgStyle} src="" />
               <p id="feedback">not logged in</p>
               <button onClick={VinylCollection.barcode}>Scan barcode</button>
               <button onClick={VinylCollection.photoSearch}>Search for an album</button>
               <Footer/>
            </div>
        );
      }
});

exports.Home = Home;
exports.Content = Content;
