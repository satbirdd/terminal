
/*
 * GET home page.
 */

exports.index = function(req, res){
  var projects = ['todo'];
    // [ 'mongod',
    //   'redis-commander',
    //   'elasticsearch',
    //   'Caramel-Server-Backends',
    //   'Caramel-Server',
    //   'todo',
    //   'Accounts',
    //   'Panama']
  res.render('index', { title: 'Terminal', projects: projects });
};