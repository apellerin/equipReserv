//USER METHODS
//Load required libraries
var async = require('async');
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var mail = require('./mailout.js');
var local = require('../local.config.js');
    mail_props = local.config.emails;
    messages = local.config.messages;

//User Object Definition
function User(user_data){
    this.user_id = user_data["user_id"],
    this.user_name = user_data["user_name"],
    this.password = user_data["password"],
    this.first_name = user_data["first_name"],
    this.last_name = user_data["last_name"],
    this.email = user_data["email"],
    this.phone = user_data["phone"],
    this.user_level = user_data["user_level"],
    this.activated = user_data["activated"],
    this.created = user_data["created"],
    this.modified = user_data["modified"],
    this.last_login = user_data["last_login"],
    this.hash = user_data["hash"]
}
    //Prototype User Object
User.prototype.user_id = null;
User.prototype.user_name = null; 
User.prototype.password = null; 
User.prototype.first_name = null;
User.prototype.last_name = null; 
User.prototype.email = null; 
User.prototype.phone = null; 
User.prototype.user_level = 0;
User.prototype.activated = false;
User.prototype.created = new Date(); 
User.prototype.modified = new Date(); 
User.prototype.last_login = null;
User.prototype.hash = null;
//User Password Validation Function
User.prototype.validatePassword = function(pw){
    return(pw == this.password);
}
//User safe response object
User.prototype.response_obj = function() {
return {    
    user_id : this.user_id,
    user_name : this.user_name,
    first_name : this.first_name,
    last_name : this.last_name,
    email: this.email,
    phone: this.phone, 
    user_level: this.user_level,
    activated: this.activated,
    created: this.created,
    modified: this.modified,
    last_login: this.last_login,
    hash: this.hash
    }
}

//USER REGISTRATION
exports.register = function(req, res) {
    //Verify required info submitted
    if(!req.body.user_name || !req.body.password || !req.body.first_name || !req.body.last_name || !req.body.email ){
           res.render('./users/register',{message: messages.incomplete_reg});
           }  
        else {
               async.waterfall([
                   //Acquire SQL connection from pool
                    function(callback){
                        sql_pool.acquire(function(err, connection){
                            callback(err, connection);
                        });
                    },
                    //Write User to Database
                    function(connection, callback){
                        var sql = 'INSERT INTO users(user_name, password, first_name, last_name, email, phone, hash) VALUES(?,?,?,?,?,?,?)';
                        //Create hash for activation link using username
                        var hash = bcrypt.hashSync(req.body.email + req.body.password, 8);
                        var inserts = [req.body.user_name, req.body.password, req.body.first_name, req.body.last_name, req.body.email, req.body.phone, hash];         
                        sql = mysql.format(sql, inserts);
                        connection.query(sql, function (err, results) {
                              sql_pool.release(connection);
                              callback(err, results, hash);   
                            });
                    },//Compare returned results 
                    function(results, hash, callback){
                        if(!results) {
                            res.render('./users/register',{message: messages.user_exists});
                        } else {
                            sendActivationLink(hash, req.body.email);
                            res.render('./users/login',{message: messages.reg_success});
                        }
                    }
               ], function (err, result) {
                        try {
                        res.redirect(req.headers['referer'],{message: messages.generic_error}); 
                        }catch(e) {
                            res.send(messages.generic_error);
                        }
                    } 
        )}
    
}
//User Authentication Function
exports.authenticate = function(req, res){
               async.waterfall([
                   //Check if user is using username or email address
                   function(callback) {
                       if (req.body.user_name.indexOf("@") != -1) {
                           getByEmail(req.body.user_name, function(results) {
                                callback(null, results);  
                                }
                        )} else {
                                getByUsername(req.body.user_name, function(results) {
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
                                    req.session.thisUser = thisUser.response_obj();
                                    updateLastLogin(thisUser.user_name);
                                    if(thisUser.user_level == -1) {
                                        res.render('./reservation/admin/pending',{user: req.session.thisUser});
                                    } else {
                                        res.render('./reservation/user/home',{user: req.session.thisUser});
                                        }   
                                } else {//if user not activated
                                    req.session.inactiveUser = thisUser.response_obj();
                                    res.render('./users/login',{notactivated: thisUser.response_obj(), message: messages.notactivated});
                                        }
                                }
                        }
                    }
                ], function (err, result) {//if unhandled exception durint auth.
                    if (err) throw new Error(err);
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


exports.getByUsername = function (user_name, cb) {
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


exports.getByHash = function(hash, cb){
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
            var inserts = ['users','hash', hash];
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
            throw new Error('Error occured in retrieving account by hash');
        }
    )
}

//If credentials invalid render appropriate page & message
invalidCredentials = function(req, res){
    res.render('./users/login',{message: messages.invalid_credentials, user: null});
}


//Send activation link via email
exports.sendActivationLink = function(hash, email){
    sendActivationLink(hash, email);
}

//local send activation link function
sendActivationLink = function(hash, email){
        var text = mail_props.user_activation_email.text
            + mail_props.user_activation_email.link + hash;
        mail.sendEmail(text, email, mail_props.user_activation_email.subject);
}

exports.activate = function (req, res) {
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
                        var inserts = ['users', 'activated', 'hash', req.query.id];
                        sql = mysql.format(sql,inserts);
                        connection.query(sql, function(err, results) {
                              sql_pool.release(connection);
                              res.render('./users/login',{message: messages.post_activate});  
                            });   
                     }
                ], function (err, result) {
                        res.send(messages.generic_error);
                      
                    })
}
//Logout User
exports.logOut = function(req, res){
    req.session.thisUser = undefined;
    res.render('./users/login');
}


exports.recoverPassword = function(req, res){
    //takes an email address and sends an email with a link to reset the password    
    var email = req.body.email; 
    async.waterfall([
                   //Acquire SQL connection from pool
                    function(callback){
                        sql_pool.acquire(function(err, connection){
                            callback(err, connection);
                        });
                    },
                    //Get activation hash based on user email
                    function(connection, callback){
                        var sql = 'SELECT hash FROM users WHERE email = ?'
                        var inserts = [email];
                        sql = mysql.format(sql,inserts);
                        connection.query(sql, function(err, results) {
                              sql_pool.release(connection);
                              callback(err, results);  
                            });   
                     },
                    function(results, callback) {
                        if(results.length == 0) {
                            res.render('./users/login',{message: messages.no_matching_account});
                        } else {
                            var hash = results[0].hash;
                            callback(null, hash);
                            }
                    },
                    function(hash){
                        var text = mail_props.reset_password_email.text +
                            mail_props.reset_password_email.link + hash
                        mail.sendEmail(text, email, mail_props.reset_password_email.subject);
                        res.render('./users/login',{email: email, resetpassword: true, message: messages.resetpassword});
                    }
                ], function (err, result) {
                        res.send(messages.generic_error);
                      
                    })
}
    

updateLastLogin = function(user_name){
//called on succesful login.  Updates database table.    
     async.waterfall([
                   //Acquire SQL connection from pool
                    function(callback){
                        sql_pool.acquire(function(err, connection){
                            callback(err, connection);
                        });
                    },
                    //Update User Activation Status
                    function(connection, callback){
                        var sql = 'UPDATE users SET last_login = Now() WHERE user_name = ?'
                        var inserts = [user_name];
                        sql = mysql.format(sql,inserts);
                        connection.query(sql, function(err, results) {
                              sql_pool.release(connection);
                            });   
                     }
                ], function (err, result) {
                        res.send(messages.generic_error);
                      
                    })
} 

//Validate - Then Update User Data
exports.update = function(req, res){
    exports.getByHash(req.session.thisUser.hash, function(user){
        thisUser = user;
        if(thisUser.validatePassword(req.body.password)){
            if(!req.body.user_name || !req.body.password || !req.body.first_name || !req.body.last_name || !req.body.email ){
                   req.body.user_level = req.session.thisUser.user_level;
                   res.render('./users/account',{user: req.body, message: messages.invaliduserupdate});
                   return;
            }
            else { 
                getByUsername(req.body.user_name, function(user){
                    if(user && (req.body.user_name != req.session.thisUser.user_name)){
                        req.body.user_level = req.session.thisUser.user_level;
                        res.render('./users/account',{user: req.body, message: messages.username_exists});        
                    }
                    else {
                        getByEmail(req.body.email, function(user){
                            if(user && (req.body.email != req.session.thisUser.email)){
                                req.body.user_level = req.session.thisUser.user_level;
                                res.render('./users/account',{user: req.body, message: messages.email_exists});    
                            }
                            else {
                                performUpdate(req,res);
                            }
                        });
                    }
                });
            }
        }
        else {
            req.body.user_level = req.session.thisUser.user_level;
            res.render('./users/account',{user: req.body, message: messages.invalidpassword});  
        }
    });
}


performUpdate = function(req,res) {

    exports.getByHash(req.session.thisUser.hash, function(user){
        var newUser = req.body;
        var oldUser = user;
        sql = 'UPDATE users SET user_name = ?, first_name = ?, last_name = ?, \
                email = ?, phone = ?, modified = NOW(), hash = ? WHERE user_name = ?';

        var hash = bcrypt.hashSync(req.body.email + req.body.password, 8);

        inserts = [newUser.user_name, newUser.first_name, newUser.last_name,
                    newUser.email, newUser.phone, hash, oldUser.user_name];
                    
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
                    req.session.thisUser = user;
                    res.render('./users/account',{user: req.session.thisUser, message: messages.accountupdated});
                });
            }
        ], function (err, result) {  
            res.render('index',{message: {message: err, messagetype: 'error',messageheader: 'OOOOPS!  '}, user: req.session.thisUser});
                      
            })
    });
            
}


exports.changePassword = function(req, res){
    exports.getByHash(req.session.thisUser.hash, function(user){
        thisUser = user;
        if(! thisUser.validatePassword(req.body.oldpassword)){
            res.render('./users/account',{user: req.session.thisUser, message: messages.invalidpassword});  
        }
        else {
            updatePassword(req,res);
        }
    });
}

exports.resetPassword = function(req, res){
    exports.getByHash(req.session.thisUser.hash, function(user){
        thisUser = user;
        updatePassword(req,res);
    });
}


updatePassword = function(req, res){
    var oldpass = req.body.oldpassword;
    var newpass = req.body.password;
    if(oldpass == newpass){
        res.render('/changepass',{user: req.session.thisUser, message: messages.noupdate});
    }
        else { 
            sql = 'UPDATE users SET password = ?, modified = NOW(), hash = ? WHERE user_name = ?';

            var hash = bcrypt.hashSync(req.body.email + req.body.password, 8);

            inserts = [newpass, hash, req.session.thisUser.user_name];
                    
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
                    getByUsername(req.session.thisUser.user_name, function(user){
                        req.session.thisUser = user;
                        res.render('./users/login',{user: undefined ,message: messages.accountupdated});
                    });
                }
            ], function (err, result) {  
                res.render('index',{message: {message: err, messagetype: 'error',messageheader: 'OOOOPS!  '}, user: req.session.thisUser});
                      
                })
        }
            
    }

exports.listUsers = function(length, page, filter, cb){
    async.waterfall([
        //Acquire SQL connection from pool
        function(callback){
            sql_pool.acquire(function(err, connection){
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function(connection, callback){
            var sql =  "SELECT user_name, first_name, last_name, email, user_level, activated, modified, last_login \
                        FROM users \
                        WHERE user_name like '%" + filter + "%'	OR first_name like '%" + filter + "%' \
                    	OR last_name like '%" + filter + "%' OR email like '%" + filter + "%'\
                        ORDER BY user_name LIMIT ?,?";
            var inserts = [(length*page),length];
            sql = mysql.format(sql,inserts);
            connection.query(sql, function(err, results) {
                sql_pool.release(connection);
                callback(err, results);
            });
        },
        //
        function(results, callback) {
            if(results.length < 1){
                cb(null);
            }else{
                var items = new Array();
                results.forEach(function(e) {
                    items.push(e);
                });
                cb(items);
            }
    }], function (err, results) {
            throw new Error(err);
        }
    )

};

exports.adminUpdate = function (req, cb) {

        sql = 'UPDATE users SET user_name = ?, first_name = ?, last_name = ?, email = ?, phone = ?, user_level = ?, activated = ?, modified = NOW() WHERE user_name = ?';

        inserts = [req.body.user_name, req.body.first_name, req.body.last_name,
                    req.body.email, req.body.phone, parseInt(req.body.user_level),
                    parseInt(req.body.activated), req.body.user_name];

        async.waterfall([
            //Acquire SQL connection from pool
            function (callback) {
                sql_pool.acquire(function (err, connection) {
                    callback(err, connection);
                });
            },
            //execute sql
            function (connection, callback) {
                sql = mysql.format(sql, inserts);
                connection.query(sql, function (err, results) {
                    sql_pool.release(connection);
                    callback(err, results);
                });
            },
            function (results) {
                cb(results);
            }
        ], function (err, result) {
            if (err) throw new Error(err);
        })
}

exports.deleteUser = function (user_name, cb) {

    sql = 'DELETE FROM users WHERE user_name = ?';

    inserts = [user_name];

    async.waterfall([
        //Acquire SQL connection from pool
        function (callback) {
            sql_pool.acquire(function (err, connection) {
                callback(err, connection);
            });
        },
        //execute sql
        function (connection, callback) {
            connection.query(sql, function (err, results) {
                sql_pool.release(connection);
                callback(err, results);
            });
        },
        function (results) {
            cb(results);
        }
    ], function (err, result) {
        if (err) throw new Error(err);
    })
}