var util = require('util');
var stream = require('stream');
var spotify = require('spotify-node-applescript');
var async = require('async');
var _ = require('underscore');
var http = require('http');
var https = require('https');
var fs = require('fs');

util.inherits(Driver,stream);
util.inherits(Device,stream);

var log = console.log;

function Driver(opts,app) {
  var self = this;

  app.on('client::up',function(){
    self.emit('register', new Device(app, self));
  });

}

function WebCamDevice(app) {

}

function Device(app, driver) {
  var self = this;

  this._app = app;
  this.writeable = true;
  this.readable = true;
  this.V = 0;
  this.D = 240; // display_text, should be speech
  this.G = 'spotify';
  this.name = 'Spotify - ' + require('os').hostname();

  // Register our webcam subdevice TODO: Cleanup

  this._coverDevice = new CoverDevice(app);
  driver.emit('register', this._coverDevice);

  function queueUpdate() {
    setTimeout(function() {
      self.updateState(queueUpdate);
    }, 300);
  }

  queueUpdate();
}

Device.prototype.updateState = function(cb) {
  var self = this;
  async.parallel([
      spotify.getState, spotify.getTrack
  ], function(err, result) {
      var state = result[0], track = result[1];

      if (!self._data ||
          !_.isEqual(track, self._data.track) ||
          state.state != self._data.state.state ||
          state.volume != self._data.state.volume) {
        try {
          if (!self._data || state.track_id != self._data.state.track_id) {
            self._coverDevice.sendCoverArt();
          }
        } catch(e) {
          console.log('err!!!', err);
        }


        // Something has changed. Let's emit.
        self._data = {
          state: state,
          track: track
        };
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


function CoverDevice(app) {
  this._app = app;
  this.writeable = true;
  this.readable = true;
  this.V = 0;
  this.D = 1004;
  this.G = 'spotifycover';
  this._guid = [this._app.id,this.G,this.V,this.D].join('_');
  this.name = 'Spotify Cover Art - ' + require('os').hostname();

}

util.inherits(CoverDevice, stream);

CoverDevice.prototype.write = function(data) {
  // Don't care. We only send when the state changes
  this.sendCoverArt();

};

CoverDevice.prototype.sendCoverArt = function(id) {
  var self = this;

  spotify.getArtwork(function(err, artworkFile) {
    console.log('Got artwork', artworkFile);

      var postOptions = {
        host:self._app.opts.streamHost,
        port:self._app.opts.streamPort,
        path:'/rest/v0/camera/'+self._guid+'/snapshot',
        method:'POST',
        headers: {
          'X-Ninja-Token': self._app.token
          , 'Content-Type' : 'image/png'
          , 'Expires' : 'Mon, 3 Jan 2000 12:34:56 GMT'
          , 'Pragma' : 'no-cache'
          , 'transfer-encoding' : 'chunked'
          , 'Connection' : 'keep-alive'
        }
      };

      var proto = (self._app.opts.streamPort==443) ? https:http;

      //send a file to the server
      var fileStream = fs.createReadStream(artworkFile);

      var postReq = proto.request(postOptions,function(postRes) {
          postRes.on('end',function() {
            log('Stream Server ended');
          });
          postRes.resume();
      });

      postReq.on('error',function(err) {
        log('Error sending picture: ');
        log(err);
      });

      var lenWrote=0;
      fileStream.on('data',function(data) {
        postReq.write(data,'binary');
        lenWrote+=data.length;
      });

      fileStream.on('end',function() {
        postReq.end();
        log("Image sent %s",lenWrote);
      });
      fileStream.resume();

      fileStream.on('error',function(error) {
        log(error);
      });
     // fileStream.end();

  });
};


module.exports = Driver;
