//Create mySQL Connection Pools
module.exports.startPool = function() {
    var generic_pool = require('generic-pool');
    var mysql = require('mysql');
    var local = require('../local.config.js');
    conn_props = local.config.db_config;
    var pool = generic_pool.Pool({
    name: 'mysql',
    max: conn_props.max_poolsize,
    min: conn_props.min_poolsize,
    create: function(callback) {
        var c = mysql.createConnection({
            host:     conn_props.host,
            user:     conn_props.user,
            password: conn_props.password,
            database: conn_props.database
            });
        c.connect(function(err, server) {
            callback(err, c);
            });
        },
        destroy: function(c) {
            c.end();
        },
        idleTimeoutMillis : conn_props.idle_timeout_ms,
        log : conn_props.log_pool
    });
    if(pool){
   return pool;
    }
    else {
        throw new Error('unable to create sql pool!');
        } 


}