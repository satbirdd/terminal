var ChildProcess = require('child_process');
var escape = require('escape-html');

exports.Terminal = function(project, socket) {
  var args = get_args_by_project(project);
  var app_process = ChildProcess.spawn(args.command, args.args, args.options);
  var interact_process = ChildProcess.spawn("/bin/sh", [], args.options);

  app_process.bind_socket = function(socket) {
    var self = this;
    this.stdout.on('data', function(data) {
      socket.emit(project, {out: escape(data.toString())});
    });

    this.stderr.on('data', function(data) {
      socket.emit(project, {err: escape(data.toString())})
    })

    socket.on(project + '_input', function(data) {
      self.stdin.write(data.command + '\n');
    })
  }

  interact_process.bind_socket = function(socket) {
    var self = this;
    this.stdout.on('data', function(data) {
      socket.emit(project + '-interact', {out: escape(data.toString())});
    });

    this.stderr.on('data', function(data) {
      socket.emit(project + '-interact', {err: escape(data.toString())})
    })

    socket.on(project + '_interact_input', function(data) {
      var command = data.command + '\n';
      socket.emit(project + '-interact', {out: ">> " + escape(command)})
      self.stdin.write(command);
    })
  }

  app_process.bind_socket(socket);
  interact_process.bind_socket(socket);

  app_process.on('exit', function(data) {
    socket.emit(project, {out: "====== this process is going to shut down!! ======\n"})
  })

  return app_process;
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