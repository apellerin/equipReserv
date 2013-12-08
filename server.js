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

    var worker_id = 'Worker' + cluster.worker.id;

    var express = require('express');
    var routes = require('./routes');
    var user = require('./routes/user');
    var http = require('http');
    var path = require('path');
    var async = require('async');
    var generic_pool = require('generic-pool');
    var mysql = require('mysql');

    var app = express();

    //Configuration
    app.use( express.cookieParser() );
    var MongoStore = require('connect-mongo')(express);
    //Set up mongodb session store
    app.use(express.session({
        store: new MongoStore({
            db: 'appName',
            host: '127.0.0.1',
            port: 27017
        }), secret: 'S3KR#T'
    }));

    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(require('stylus').middleware(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'public')));


    // development only
    if ('development' == app.get('env')) {
      app.use(express.errorHandler());
    }


    //Routes
    app.get('/', routes.index);

    // Start the app
    http.createServer(app).listen(app.get('port')) 
        console.log('Express app started by %s', worker_id);
        
        //Create mySQL Connection Pool's (25 per CPU)
        var local = require('./local.config.js');
        conn_props = local.config.db_config;
        var pool = generic_pool.Pool({
        name: 'mysql',
        max: 10,
        create: function(callback) {
            var c = mysql.createConnection({
                host:     conn_props.host,
                user:     conn_props.user,
                password: conn_props.password,
                database: conn_props.database
                })
            c.connect(function(err, server) {
                callback(err, c);
                });
            },
            destroy: function(c) {
                c.end();
            },
            idleTimeoutMillis : 30000,
            //log : true 
        });
   
        pool.acquire(function(err, client) {
                if (err) {
                    console.log('Error connecting to database');}
                else {
                    client.query('INSERT INTO test (idTEST) VALUES(\'' + worker_id + '\')');
                    pool.release(client);
                    }
                });
            }