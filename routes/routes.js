var users = require('../lib/users.js');

module.exports = function(app){

     //User Routes
    app.namespace('/users', function(req, res) {
        app.post('/authenticate',function(req,res) {
            users.authenticate(req, res)
              });
        });
            
    
    
    
    //Catch all requests and verify login state.
    app.all('*',function(req,res,next){
        users.isLoggedIn(req, 
            function(result){
                if (result) {
                next();
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
