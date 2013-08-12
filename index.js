var util = require('util');
var stream = require('stream');
var spotify = require('spotify-node-applescript');
var async = require('async');
var _ = require('underscore');
var request = require('request');
var Datauri = require('datauri');

util.inherits(Driver,stream);
util.inherits(Device,stream);

var log = console.log;

function Driver(opts,app) {
  var self = this;

  app.on('client::up',function(){
    self.emit('register', new Device(app, self));
  });

}

function Device(app, driver) {
  var self = this;

  this._app = app;
  this.writeable = true;
  this.readable = true;
  this.V = 0;
  this.D = 284;
  this.G = 'spotify';
  this.name = 'Spotify - ' + require('os').hostname();

  function queueUpdate() {
    setTimeout(function() {
      self.updateState(queueUpdate);
    }, 300);
  }

  queueUpdate();
}

function getArtwork(id, cb) {
  //id = id.substring(id.lastIndexOf(':') + 1);

  /*request('http://open.spotify.com/track/' + id, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log('body', body);
      var url = body.match(/(http:\/\/o.scdn.co\/300\/[0-9a-f]*)/);
      console.log('url', url[1]);
      artwork[id] = url[1];
      cb(url[1]);
    } else {
      console.log('Failed to get spotify artwork', error, response.statusCode);
      cb('https://d2b1xqaw2ss8na.cloudfront.net/static/img/defaultCoverL.png');

    }
  });*/

  request('https://embed.spotify.com/?uri=' + id, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log('body', body);
      var url = body.match(/(http:\/\/o.scdn.co\/300\/[0-9a-f]*)/);
      if (url && url.length > 1) {
	console.log('url', url[1]);
	artwork[id] = url[1];
	cb(url[1]);
      }
    }

    console.log('Spotify : Failed to get spotify artwork', error, response.statusCode);
    cb('https://d2b1xqaw2ss8na.cloudfront.net/static/img/defaultCoverL.png');
  });

}

var artwork = {};

Device.prototype.updateState = function(cb) {
  var self = this;
  async.parallel([
      spotify.getState, spotify.getTrack
  ], function(err, result) {
      var state = result[0], track = result[1];

      if (!state || !track) {
        cb();
        return;
      }

      if (!self._data ||
        !_.isEqual(track, self._data.track) ||
        state.state != self._data.state.state ||
        state.volume != self._data.state.volume) {

        if (!self._data || state.track_id != self._data.state.track_id) {

          if (!artwork[track.id]) {
            getArtwork(track.id, function(url) {
              artwork[track.id] = url;
              self._data.image = url;
              self.emit('data', self._data);
            });
          }
        }

        // Something has changed. Let's emit.
        self._data = {
          state: state,
          track: track,
          image: artwork[track.id]
        };

        console.log("Self data now", self._data);

        self.emit('data', JSON.parse(JSON.stringify(self._data)));
      }

      if (cb) cb();
  });

};

Device.prototype.write = function(data) {
  if (data.command) {
    if (typeof spotify[data.command] === 'function') {
      spotify[data.command].call(spotify, data.args);
      delete(this._data); // Mark as dirty so we emit
      this.updateState();
    } else {
      console.error('Unknown command', data.command);
    }
  }
};

module.exports = Driver;
