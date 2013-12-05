var ChildProcess = require('child_process');

exports.Terminal = function(project, socket) {
  var args = get_args_by_project(project);
  var child_process = ChildProcess.spawn(args.command, args.args, args.options);

  child_process.stdout.on('data', function(data) {
    socket.emit(project, {out: data.toString()});
  });

  child_process.stderr.on('data', function(data) {
    socket.emit(project, {err: "" + data.toString()})
  })

  child_process.on('readable', function() {
    socket.emit('waiting_input');
    socket.once('input', function(data) {
      child_process.unshift(data.command);
    })
  })

  child_process.on('exit', function(data) {
    socket.emit(project, {out: "====== this process is going to shut down!! ======\n"})
  })

  return child_process;
}

function get_args_by_project(project) {
  return exec_args[project];
}

var exec_args = {
  // "mongod": { type: 'exec',
  //             command: 'echo porcorosso | sudo -S mongod' },
  // "redis-commander": { type: 'exec',
  //                       command: 'redis-commander' },
  // "elasticsearch": 'cd && cd ruby/search/elasticsearch-rtf/elasticsearch/bin/service/ && ./elasticsearch console',
  // "Caramel-Server-Backends": 'cd && cd node/Caramel-Server && node backends.js',
  // "Caramel-Server": 'cd && cd node/Caramel-Server && node app.js',
  // "Accounts": 'cd && cd works/Accounts && rails s -p 3001',
  // "Panama": 'cd && cd works/Panama && rails s puma',
  "todo": { 
    command: "rails",
    args: ['s'],
    options: {
      cwd: '/home/raymond/ruby/todos/',
    }
  }
}