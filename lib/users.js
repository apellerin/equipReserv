//USER METHODS
//Load required libraries
var async = require('async');
var mysql = require('mysql');

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
    this.last_login = user_data["last_login"]
}
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
User.prototype.validatePassword = function(pw){
    return(pw == this.password);
}
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
    last_login: this.last_login
    }
}
exports.isLoggedIn = function(req, callback){
    callback(req.session.isLoggedIn);
    };
exports.authenticate = function(req, res){
               async.waterfall([
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
                        if(thisUser === null){
                            invalidCredentials(req, res);
                        }
                        else {
                            if(!thisUser.validatePassword(req.body.password)) {
                                invalidCredentials(req, res);
                            } else {
                                req.session.isLoggedIn = true;
                                req.session.thisUser = thisUser.response_obj();
                                res.render('index',{title: 'Welcome'});
                                }
                        }
                    }
                ], function (err, result) {
                    throw new Error('An exception occurred during user authentication');
                    }
            ); 
}
exports.getByEmail = function(email, cb) {
    getByEmail(email, cb);
}
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
                    if (err) throw err;
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
exports.getByUsername = function(user_name, cb) {
    getByUsername(user_name, cb);
}
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
                    if (err) throw err;
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
invalidCredentials = function(req, res){
    req.session.login_message = 'Invalid credentials.  Please log in or register';
    res.render('login',{title : 'Login', message: req.session.login_message});
}


//USER REGISTRATION
exports.register = function(req, res) {
    //Verify required info submitted
    if(!req.body.username || !req.body.password || !req.body.first_name || !req.body.last_name || !req.body.email ){
           req.session.register_message = 'Registration form missing data.  Please correct and resubmit.';
           res.render('register',{title : 'Register', message: req.session.register_message});
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
                                   'email, phone) VALUES(?,?,?,?,?,?,?)';
                      

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
                    } 
        )}
    
}// END REGISTRATION
exports.activate = function(User){}
exports.update = function(User){}
exports.recoverPassword = function(username, email){}
exports.delete = function(User){}
exports.updateLastLogin = function(){}






 