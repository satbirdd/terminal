var ChildProcess = require('child_process');

exports.Terminal = function(project, socket, args) {
  var child_process = ChildProcess.exec(args);

  child_process.stdout.on('data', function(data) {
    socket.emit(project, {out: data});
  });

  child_process.stderr.on('data', function(data) {
    socket.emit(project, {err: data})
  })

  child_process.on('readable', function() {
    socket.emit('waiting_input');
    socket.once('input', function(data) {
      child_process.unshift(data.command);
    })
  })
}