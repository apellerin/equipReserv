var users = require('../lib/users.js');

module.exports = function(app){

     //User Routes
    app.namespace('/users', function(req, res) {

        //User Authentication/Login
        app.post('/authenticate',function(req,res) {
            users.authenticate(req, res)
              });
        
            
         //User Registration
        app.post('/register',function(req,res) {
            users.register(req, res)
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
