var users = require('../lib/users.js');

module.exports = function(app){

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
      
    //User Routes
    app.namespace('/users', function() {

        //Register New Users
        app.post('/', users.registerUser);
         
           

          
      });//end namespace



    //Create Error Response - No Route Exists
    app.all('*', function(req, res, next){
        throw new Error('The resource does not exist.');
    });


}
