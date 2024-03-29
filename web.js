var http = require('http'),
  faye = require('faye');

var server = http.createServer(),
  bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});

var authorized = function(message) {
  if (message.data.hmac === process.env.FAYE_KEY) {
    return true;
  } else {
    return false;
  }
};

bayeux.addExtension({
  incoming: function(message, callback) {
    if (message.channel.indexOf('/meta/') !== 0) {
      if (!authorized(message)) {
        message.error = '403::Authentication required';
      } else {
        if (message.data.hmac) {
          delete message.data.hmac;
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