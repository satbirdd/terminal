
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var Terminal = require('./lib/terminal').Terminal;

var app = express();

// all environments
app.set('port', process.env.PORT || 2000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);


io.sockets.on('connection', function(socket) {
  var processes = {};

  socket.on('new_project', function(data) {
    var project = data.project;
    var child_process = Terminal(project, socket);
    processes[project] = child_process;
  })

  socket.on('restart', function(data) {
    var project = data.project;
    console.log('......... restart ..........')
    console.log(!!processes[project], !!project)
    if (processes[project] && project) {
      processes[project].on("exit", function(feedback) {
        if (0 == feedback) {
          var child_process = Terminal(project, socket);
          processes[project] = child_process;
          console.log('........ restart', feedback, '..........')
        } else {
          console.log('........no restart', feedback, '..........')
        }
      })
      processes[project].kill();
    }
  })
});