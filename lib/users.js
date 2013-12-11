//USER METHODS

//Load required libraries
var async = require('async');
var mysql = require('mysql');
var bcrypt = require('bcrypt');

exports.isLoggedIn = function(req, callback){
    callback(req.session.isLoggedIn);
    };

//USER AUTHENTICATION
exports.authenticate = function(req, res){

        //Verify Username & Password Submitted
       if(!req.body.username || !req.body.password){
           req.session.login_message = 'Please provide a username and password';
           res.render('login',{title : 'Login', message: req.session.login_message});
           } else {
               async.waterfall([
                   //Acquire SQL connection from pool
                    function(callback){
                        sql_pool.acquire(function(err, connection){
                            callback(err, connection);
                        });
                    },
                    //Verify credentials against database
                    function(connection, callback){
                        var sql = 'SELECT * FROM ?? WHERE ?? = ?';
                        var inserts = ['users','user_name', req.body.username];
                        sql = mysql.format(sql,inserts);
                        connection.query(sql,
                         function(err, results) {
                              if (err) throw err;
                              callback(err, results);   
                            });
                        
                    },//Compare returned results 
                    function(results, callback){
                        if(results.length == 0 || results[0].password != req.body.password){
                            req.session.login_message = 'Invalid credentials.  Please log in or register';
                            res.render('login',{title : 'Login', message: req.session.login_message});
                            } else {
                                req.session.isLoggedIn = true;
                                res.render('index',{title: 'Welcome'});
                                }
                                                    
                    }
                ], function (err, result) {
                   throw new Error('An exception occurred during user authentication');
                }); 
            }
}//End Authenticate

//USER REGISTRATION
exports.register = function(req, res) {
    //Verify required info submitted
    if(!req.body.username || !req.body.password || !req.body.first_name || !req.body.last_name || !req.body.email ){
           req.session.register_message = 'Registration form missing data.  Please correct and resubmit.';
           res.render('register',{title : 'Register', message: req.session.register_message});
           }  else {
               async.waterfall([function(callback){
                   //ENCRYPT PASSWORD
                        bcrypt.genSalt(10, function(err, salt) {
                            bcrypt.hash(req.body.password, salt, function(err, hash) {
                                req.body.password = hash;
                                callback(err);
                            });
                        });
                    },
                   //Acquire SQL connection from pool
                    function(callback){
                        sql_pool.acquire(function(err, connection){
                            callback(err, connection);
                        });
                    },
                    //Write User to Database
                    function(connection, callback){
                        var sql = 'INSERT INTO users(user_name, password, first_name, last_name, nickname,' +
                                   'email_address, phone) VALUES(?,?,?,?,?,?,?)';
                      

                        var inserts = [req.body.username, req.body.password, req.body.first_name, req.body.last_name,
                                        req.body.nickname, req.body.email, req.body.phone];
                        
                        sql = mysql.format(sql,inserts);
                        console.log(sql);
                        connection.query(sql,
                         function(err, results) {
                              if (err) throw err;
                              callback(err, results);   
                            });
                        
                    },//Compare returned results 
                    function(results, callback){
                        console.log(JSON.stringify(results));
                    }
                ], function (err, result) {
                   throw new Error('An exception occurred during user registration');
                    }); 
        }
}// END REGISTRATION
        


    