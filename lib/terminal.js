var ChildProcess = require('child_process');
var escape = require('escape-html');

exports.Terminal = function(project, socket) {
  var args = get_args_by_project(project);
  console.log('......', project, '...........')
  var result_back = {};
  var app_process = ChildProcess.spawn(args.command, args.args, args.options);
  result_back["app"] = app_process;

  if (args.options && args.options.cwd) {
    var interact_process = ChildProcess.spawn("/bin/sh", [], args.options);
    result_back["interact"] = interact_process;
  }

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

  if (interact_process) {
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
  }

  app_process.bind_socket(socket);
  if (interact_process) interact_process.bind_socket(socket);

  app_process.on('exit', function(data) {
    socket.emit(project, {out: "====== this process is going to shut down!! ======\n"})
  })

  result_back.bind_socket = function(socket) {
    this.app.bind_socket(socket);
    if (this.interact) this.interact.bind_socket(socket);
  }

  result_back.kill = function() {
    this.app.kill();
    if (this.interact) this.interact.kill();
  }

  return result_back;
}

function get_args_by_project(project) {
  return exec_args[project];
}

var user_file_path = "/home/robin/"

var exec_args = {
  "mongod": {
    type: 'spawn',
    // command: 'echo porcorosso | sudo -S mongod',
    command: '/bin/sh',
    args: ['echo porcorosso | sudo -S mongod']},
  "redis-commander": {
    type: 'spawn',
    command: 'redis-commander'},
  "elasticsearch": {
    type: 'spawn',
    command: './elasticsearch',
    args: ['console'],
    options: {
      cwd: user_file_path + 'ruby/search/elasticsearch-rtf/elasticsearch/bin/service/'
    }},
  "Caramel-Server-Backends": {
    type: 'spawn',
    command: 'node',
    args: ['backends.js'],
    options: {
      cwd: user_file_path + 'node/Caramel-Server/'
    }},
  "Caramel-Server": {
    type: 'spawn',
    command: 'node',
    args: ['app.js'],
    options: {
      cwd: user_file_path +  'node/Caramel-Server/'
    }},
  "Accounts": {
    type: 'spawn',
    command: 'rails',
    args: ['s', '-p', '3001'],
    options: {
      cwd: user_file_path +  'works/Accounts/'
    }},
  "Panama": {
    type: 'spawn',
    command: 'rails',
    args: ['s', 'puma'],
    options: {
      cwd: user_file_path +  'works/Panama/'
    }},
  "todo": {
    command: "rails",
    args: ['s'],
    options: {
      cwd: '/home/raymond/ruby/todos/',
    }
  },
  "coolcloth": {
    command: "rails",
    args: ["s", "-p", "5000"],
    options: {
      cwd: '/home/raymond/ruby/coolcloth/'
    }
  }
}