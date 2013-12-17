var users = require('../lib/users.js');



//Application Routing Logic
module.exports = function(app){

     //User Routes
    app.namespace('/users', function(req, res) {
        

        //User Authentication/Login
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
            var thisUser = req.session.thisUser;
            users.sendActivationLink(thisUser.activation_hash, thisUser.email);
            res.render('login');
        });
        //update user account
        app.post('/update',function(req,res){
           if(!users.isLoggedIn) {res.render('login');}
           else{  
               users.update(req,res);
               }
        });
        //logout user
        app.get('/logout',function(req,res){
            users.logOut(req,res);
        });
      
    });//End Users Namespace
    

    //Catch all requests and verify login state.
    app.all('*',function(req,res,next){
        users.isLoggedIn(req, 
            function(result){
                if (result) {
                    res.render('index',{title: 'Welcome'});
                }else{
                    res.render('login',{title : 'Login'});
                }
        });
    });
    
    //Create Error Response - No Route Exists
    app.all('*', function(req, res){
        throw new Error('The resource does not exist.');
    });


}
