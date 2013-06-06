
var opts = {};

var d = new (require('index'))(opts, {
    on : function(x,cb){
        setTimeout(cb, 100);
    },
    log: {
        debug: console.log,
        info: console.log,
        warn: console.log,
        error: console.log
    },
    opts: {
        cloudHost : "zendo.ninja.is",
        apiHost : "api.ninja.is",
        streamHost : "stream.ninja.is"
    },
    token: 'XXX'
});

var driver;

d.emit = function(channel, value) {
    console.log('Driver.emit', channel, value);
    if (channel == 'register') {
        driver = value;
        value.emit = function(channel, value) {
            console.log('Device.emit', channel, value);
        };
    }
};

d.save = function() {
    console.log('Saved opts', opts);
};

setTimeout(function() {
    console.log('pausing');
    /*driver.write({
        command: 'jumpTo',
        args:10
    });*/
}, 2000);
