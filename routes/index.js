
/*
 * GET home page.
 */

exports.index = function(req, res){
  var projects =
    [ 'mongod',
      'elasticsearch',
      'Caramel-Server-Backends',
      'Caramel-Server',
      'Accounts',
      'Panama']
  res.render('index', { title: 'Terminal', projects: projects });
};