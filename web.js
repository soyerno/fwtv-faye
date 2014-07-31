var http = require('http'),
  faye = require('faye');

var server = http.createServer(),
  bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});

var authorized = function(message) {
  console.log('auth recv: ' + message.hmac);
  console.log('auth expc: ' + process.env.FAYE_KEY);
  if (message.hmac === process.env.FAYE_KEY) {
    return true;
  } else {
    return false;
  }
};

bayeux.addExtension({
  incoming: function(message, callback) {
    console.log(message);
    if (message.channel !== '/meta/subscribe') {
      if (!authorized(message)) {
        message.error = '403::Authentication required';
      } else {
        if (message.hmac) {
          delete message.hmac;
        }
        callback(message);
      }
    } else {
      callback(message);
    }
  }
});

bayeux.attach(server);
server.listen(process.env.PORT || 8000);