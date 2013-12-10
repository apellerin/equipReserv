//Create mySQL Connection Pools
module.exports.startPool = function() {
    var generic_pool = require('generic-pool');
    var mysql = require('mysql');
    var local = require('../local.config.js');
    conn_props = local.config.db_config;
    var pool = generic_pool.Pool({
    name: 'mysql',
    max: 10,
    min: 2,
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
        idleTimeoutMillis : 30000
        //log : true 
    });
    if(pool){
   return pool;
    }
    else {
        throw new Error('unable to create sql pool!');
        } 


}