var ChildProcess = require('child_process');

exports.Terminal = function(project, socket) {
  var args = get_args_by_project(project);
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

function get_args_by_project(project) {
  return exec_args[project];
}

var exec_args = {
  "mongod": 'echo porcorosso | sudo -S mongod',
  "redis-commander": 'redis-commander'
  "elasticsearch": 'cd && cd ruby/search/elasticsearch-rtf/elasticsearch/bin/server && ./elasticsearch console',
  "Caramel-Server-Backends": 'cd && cd node/Caramel-Server && node backends.js',
  "Caramel-Server": 'cd && cd node/Caramel-Server && node app.js',
  "Accounts": 'cd && cd works/Accounts && rvm use ruby-1.9.3-p448 && rails s -p 3001',
  "Panama": 'cd && cd works/Panama && rails s puma'
}