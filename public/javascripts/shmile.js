// Set up the socket
var socket = io.connect('http://localhost:3000');

socket.on('message', function(data) {
  console.log('data is' + data);
});

socket.on('connect', function() {
  console.log('connected');
});

socket.on('test', function(data) {
  console.log('test event intercepted:  ', data);
});