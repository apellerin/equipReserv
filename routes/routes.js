var users = require('../lib/users.js');
var local = require('../local.config.js');
    messages = local.config.messages;
//Check Login Status
function isLoggedIn(req, res, next){
    if(req.session.thisUser){
        next();
    } else {
        res.render('login');
        }
}

//Application Routing Logic
module.exports = function(app){

     //User Routes
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
            res.render('register');
        });
        //User Activation
        app.get('/activate',function(req,res){
                users.activate(req,res);
        });
        //resend activation email
        app.get('/resendactivate',function(req,res){
            var inactiveUser = req.session.inactiveUser;
            users.sendActivationLink(inactiveUser.hash, inactiveUser.email);
            res.render('login');
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
                res.render('login');
            } else 
                {users.getByHash(req.query.id,function(user){
                    if(user === null){res.render('login',{message: messages.reset_link_expired});}
                    else {
                        if(user.activated == 0){
                            req.session.inactiveUser = user.response_obj();
                            res.render('notactivated',user.response_obj());
                        } else {
                            req.session.thisUser = user;
                            res.render('account',user);
                        }
                    }
                })
            }
        });
        app.get('/',function(req,res){
            res.render('login');
        });
    });//End Users Namespace
   
    
    
        
    //Create Error Response - No Route Exists
    app.all('*', function(req, res){
        res.render('login');
    });


}
