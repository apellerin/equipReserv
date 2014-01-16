var users = require('../lib/users.js');
var local = require('../local.config.js');
    messages = local.config.messages;
//Check Login Status
function isLoggedIn(req, res, next){
    if(req.session.thisUser){
        next();
    } else {
        res.render('./users/login');
        }
}

function isAdmin(req, res, next){
    if(req.session.thisUser.user_level==-1){
        next();
    } else {
            res.render('index',{user: req.session.thisUser, message: messages.notadmin});
        }
}

//Application Routing Logic
module.exports = function(app){

     //USER NAMESPACE
    app.namespace('/users', function(req, res) {
        //User Authentication
        app.post('/authenticate',function(req,res) {
            users.authenticate(req, res)
              });
         //Add New User
        app.post('/register',function(req,res) {
            users.register(req, res)
        });
         //User Registration Form
        app.get('/register',function(req,res) {
            res.render('./users/register');
        });
        //User Activation
        app.get('/activate',function(req,res){
                users.activate(req,res);
        });
        //resend activation email
        app.get('/resendactivate',function(req,res){
            var inactiveUser = req.session.inactiveUser;
            users.sendActivationLink(inactiveUser.hash, inactiveUser.email);
            res.render('./users/login',{resendactivate: messages.resend_activate});
        });
        //update user account
        app.post('/update',isLoggedIn,function(req,res){
               users.update(req,res);
        });
        //logout user
        app.get('/logout',function(req,res){
            users.logOut(req,res);
        });
        //Send password reset link
        app.post('/forgotpassword',function(req,res){
              users.recoverPassword(req, res);
        });
        //User followed reset password link
        app.get('/resetpassword',function(req,res){
            if(!req.query.id) {
                res.render('./users/login');
            } else 
                {users.getByHash(req.query.id,function(user){
                    if(user === null){res.render('./users/login',{message: messages.reset_link_expired});}
                    else {
                        if(user.activated == 0){
                            req.session.inactiveUser = user.response_obj();
                            res.render('notactivated',user.response_obj());
                        } else {
                            req.session.thisUser = user;
                            res.render('./users/changepass',user);
                        }
                    }
                })
            }
        });
        //User Account View
        app.get('/account',isLoggedIn,function(req,res){
            res.render('./users/account',{user: req.session.thisUser});
        });
        //Change Password
        app.get('/changepass',isLoggedIn,function(req,res){
            res.render('./users/changepass',{user: req.session.thisUser});
        });
        app.post('/changepass',isLoggedIn,function(req,res){
            users.changePassword(req,res);
        });
        //Default
        app.get('/',function(req,res){
            res.render('./users/login');
        });
    });//End Users Namespace
   

    //ADMINISTRATION NAMESPACE
    app.namespace('/admin',isLoggedIn,isAdmin,function() {
        app.namespace('/equipment', function() {
            app.get('/',function(req,res){
                res.render('./equipment/equipment',{user: req.session.thisUser});
            });



        });//end admin/equipment namespace

    });//end admin namespace





    
    app.get('/index',isLoggedIn,function(req, res){
        res.render('index',{user: req.session.thisUser});
    });
    
        
    //Create Error Response - No Route Exists
    app.all('*', function(req, res){
        res.render('./users/login');
    });


}
