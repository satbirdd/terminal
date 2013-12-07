
/*
 * GET home page.
 */

exports.index = function(req, res){
  var projects =
    [ 
      'mongod',
      'redis-commander',
      'elasticsearch',
      'Caramel-Server-Backends',
      'Caramel-Server',
      // 'todo',
      // 'coolcloth'
      'Accounts',
      'Panama'
    ]
  res.render('index', { title: 'Terminal', projects: projects });
};