var cluster = require('cluster');

// Master process - starts the workers
if (cluster.isMaster) {

    var cpu_count = require('os').cpus().length;

    // Create a worker process for each core
    require('os').cpus().forEach(function () {

        // Start a worker process
        cluster.fork();

    });

    // In case a worker dies, a new one should be started
    cluster.on('exit', function (worker, code, signal) {
        cluster.fork();
    });

}
    // Code for the worker processes to execute
else {

    //Load Middleware
    var worker_id = 'Worker' + cluster.worker.id;
    var express = require('express');
    var http = require('http');
    var path  = require('path');
    var mysql_pool = require('./lib/mysql_pool.js'); 
    var namespace = require('express-namespace');   

    //Initalize Express Application
    var app = express();

    //Configure Session Store
    app.use( express.cookieParser() );
    var MongoStore = require('connect-mongo')(express);
    app.use(express.session({
        store: new MongoStore({
            db: 'appName',
            host: '127.0.0.1',
            port: 27017
        }), secret: 'S3KR#T'
    }));

    //Start mySQL Pools
    sql_pool = mysql_pool.startPool();


    

    //Mount Middleware
    app.use(express.logger('dev'));
    app.use(express.compress());
    app.use(express.favicon());
    app.use(express.bodyParser());
    //app.use(express.methodOverride());
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(require('stylus').middleware(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(app.router);
    //Load Routes
    var routes = require('./routes/routes')(app);
  


    // development only
    if ('development' == app.get('env')) {
      app.use(express.errorHandler());
      app.set('view options', { pretty: true });
    }

    // Start the app
    http.createServer(app).listen(app.get('port')) 
        console.log('Express app started by %s', worker_id);
        console.log(app.get('env'));
       
}