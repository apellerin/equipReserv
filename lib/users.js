//USER METHODS
//Load required libraries
var async = require('async');
var mysql = require('mysql');
var bcrypt = require('bcrypt');

//User Object Definition
function User(user_data){
    this.user_name = user_data["user_name"],
    this.password = user_data["password"],
    this.first_name = user_data["first_name"],
    this.last_name = user_data["last_name"],
    this.nickname = user_data["nickname"],
    this.email = user_data["email"],
    this.phone = user_data["phone"],
    this.user_level = user_data["user_level"],
    this.activated = user_data["activated"],
    this.created = user_data["created"],
    this.modified = user_data["modified"],
    this.last_login = user_data["last_login"],
    this.activation_hash = user_data["activation_hash"]
}
//Prototype User Object
User.prototype.user_name = null; 
User.prototype.password = null; 
User.prototype.first_name = null;
User.prototype.last_name = null; 
User.prototype.nickname = null; 
User.prototype.email = null; 
User.prototype.phone = null; 
User.prototype.user_level = 0;
User.prototype.activated = false
User.prototype.created = null; 
User.prototype.modified = null; 
User.prototype.last_login = null;
User.prototype.activation_hash = null;
//User Password Validation Function
User.prototype.validatePassword = function(pw){
    return(pw == this.password);
}
//User safe response object
User.prototype.response_obj = function() {
return {    
    user_name : this.user_name,
    first_name : this.first_name,
    last_name : this.last_name,
    nickname: this.nickname,
    email: this.email,
    phone: this.phone, 
    user_level: this.user_level,
    activated: this.activated,
    created: this.created,
    modified: this.modified,
    last_login: this.last_login,
    activation_hash: this.activation_hash
    }
}
//Login Verification Function
exports.isLoggedIn = function(req, callback){
    //returns results of session variable
    callback(req.session.isLoggedIn);
}
//User Authentication Function
exports.authenticate = function(req, res){
               async.waterfall([
                   //Check if user is using username or email address
                   function(callback) {
                       if (req.body.username.indexOf("@") != -1) {
                           getByEmail(req.body.username, function(results) {
                                callback(null, results);  
                                }
                        )} else {
                                getByUsername(req.body.username, function(results) {
                                callback(null, results);
                                }
                        )}
                    },//Compare returned results 
                    function(thisUser, callback){
                        //if no user found execute
                        if(thisUser === null){
                            invalidCredentials(req, res);
                        }
                        else {// if user execute password validation
                            if(!thisUser.validatePassword(req.body.password)) {
                                invalidCredentials(req, res);
                            } else {//check for user activation
                                if(thisUser.activated == 1) {
                                    req.session.isLoggedIn = true;
                                    req.session.thisUser = thisUser.response_obj();
                                    res.render('index',{title: 'Welcome'});
                                    } else {//if user not activated
                                        req.session.thisUser = thisUser.response_obj();
                                        res.render('notactivated',thisUser.response_obj());
                                            }
                                }
                        }
                    }
                ], function (err, result) {//if unhandled exception durint auth.
                    throw new Error('An exception occurred during user authentication');
                    }
            ); 
}
//api accessible getByEmail function
exports.getByEmail = function(email, cb) {
    getByEmail(email, cb);
}
//local get user by email
getByEmail = function(email, cb){
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
            var inserts = ['users','email', email];
            sql = mysql.format(sql,inserts);
            connection.query(sql, function(err, results) {
                sql_pool.release(connection);
                callback(err, results);   
            });
        },
        //Create user object
        function(results, callback) {
            if(results.length < 1){
                cb(null);
            }else {
            var thisUser = new User(results[0]);
            cb(thisUser);
            }
    }], function (err, results) {
            throw new Error('Error occured in retrieving account by username');
        }
    )
}
//api accessible getByUsername
exports.getByUsername = function(user_name, cb) {
    getByUsername(user_name, cb);
}
//Local get by username
getByUsername = function(user_name, cb){
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
            var inserts = ['users','user_name', user_name];
            sql = mysql.format(sql,inserts);
            connection.query(sql, function(err, results) {
                sql_pool.release(connection);
                callback(err, results);   
            });
        },
        //Create user object
        function(results, callback) {
            if(results.length < 1){
                cb(null);
            }else {
            var thisUser = new User(results[0]);
            cb(thisUser);
            }
        }], function (err, results) {
            throw new Error('Error occured in retrieving account by username');
        }
    )
}
//If credentials invalid render appropriate page & message
invalidCredentials = function(req, res){
    res.render('login',{title : 'Login', message: 'Invalid credentials.  Please log in or register'});
}
//USER REGISTRATION
exports.register = function(req, res) {
    //Verify required info submitted
    if(!req.body.username || !req.body.password || !req.body.first_name || !req.body.last_name || !req.body.email ){
           res.render('register',{title : 'Register', message: 'Registration form missing data.  Please correct and resubmit.'});
           }  else {
               async.waterfall([
                   //Acquire SQL connection from pool
                    function(callback){
                        sql_pool.acquire(function(err, connection){
                            callback(err, connection);
                        });
                    },
                    //Write User to Database
                    function(connection, callback){
                        var sql = 'INSERT INTO users(user_name, password, first_name, last_name, nickname,' +
                                   'email, phone, activation_hash) VALUES(?,?,?,?,?,?,?,?)';
                        //Create hash for activation link using username
                        var activation_hash = bcrypt.hashSync(req.body.email, 8);
                        var inserts = [req.body.username, req.body.password, req.body.first_name, req.body.last_name,
                                        req.body.nickname, req.body.email, req.body.phone, activation_hash ];         
                        sql = mysql.format(sql,inserts);
                        connection.query(sql, function(err, results) {
                              sql_pool.release(connection);
                              callback(err, results, activation_hash);   
                            });
                    },//Compare returned results 
                    function(results, activation_hash, callback){
                        if(results.affectedrows == 0) throw new error();
                        sendActivationLink(activation_hash, req.body.email);
                        res.render('reg_success',req.body);
                    }
                ], function (err, result) {
                        try {
                        res.redirect(req.headers['referer'],{message:  'An error occurred.  Please retry your request later.'}); 
                        }catch(e) {
                            res.send('An error occurred.  Please retry your request later.');
                        }
                    } 
        )}
    
}
//Send activation link via email
exports.sendActivationLink = function(activation_hash, email){
    sendActivationLink(activation_hash, email);
}
//local send activation link function
sendActivationLink = function(activation_hash, email){
        var mail = require('./mailout.js');
        var local = require('../local.config.js');
        var text = local.config.emails.user_activation_email.text + local.config.emails.user_activation_email.link + activation_hash;
        var to = email;
        var subject = 'Account Activation';
        mail.sendEmail(text, to, subject);
    
}
exports.activate = function(req, res){
        async.waterfall([
                   //Acquire SQL connection from pool
                    function(callback){
                        sql_pool.acquire(function(err, connection){
                            callback(err, connection);
                        });
                    },
                    //Update User Activation Status
                    function(connection, callback){
                        var sql = 'UPDATE ?? SET ?? = 1 WHERE ?? = ?'
                        var inserts = ['users', 'activated', 'activation_hash', req.query.id];
                        sql = mysql.format(sql,inserts);
                        connection.query(sql, function(err, results) {
                              sql_pool.release(connection);
                              res.render('login',{message: 'Please login to complete activation'});  
                            });   
                     }
                ], function (err, result) {
                        res.send('An error occurred.  Please retry your request later.');
                      
                    })
}
//Logout User
exports.logOut = function(req, res){
    req.session.isLoggedIn = false;
    res.render('login');
}
//Update User Data
exports.update = function(req, res){
    var oldUser = req.session.thisUser;
    var newUser = new User(req.body);
    if(!oldUser) {res.redirect('login');}
        else { 
            sql = 'UPDATE users SET user_name = ?, first_name = ?, last_name = ?, \
                    email = ?, phone = ?, modified = NOW(), activation_hash = ? WHERE user_name = ?';

            var activation_hash = bcrypt.hashSync(req.body.email, 8);

            inserts = [newUser.user_name, newUser.first_name, newUser.last_name,
                        newUser.email, newUser.phone, activation_hash, oldUser.user_name];
                    
             async.waterfall([
                   //Acquire SQL connection from pool
                    function(callback){
                        sql_pool.acquire(function(err, connection){
                            callback(err, connection);
                        });
                    },
                    //execute sql
                    function(connection, callback){
                        sql = mysql.format(sql,inserts);
                        connection.query(sql, function(err, results) {
                              sql_pool.release(connection);
                              callback(err);
                            });   
                     },
                    function(result){
                        getByUsername(newUser.user_name, function(user){
                            req.session.thisUser = user.response_obj();
                            res.render('account',req.session.thisUser);
                        });
                    }
                ], function (err, result) {
                        res.send('An error occurred.  Please retry your request later.');
                      
                    })
            
            
            }
    
}

//functions to be built
exports.recoverPassword = function(email){
    //takes an email address and sends an email with a link to reset the password    
    
}
exports.changePassword = function(){
//form uses activation hash to reset the password    
    
}
exports.updateLastLogin = function(){
//called on succesful login.  Updates database table.    
    
    
}