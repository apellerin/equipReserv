//USER METHODS
exports.isLoggedIn = function(req, callback){
    callback(req.session.isLoggedIn);
    };

exports.authenticate = function(req, res){
   
}


    