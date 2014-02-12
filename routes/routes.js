var fs = require('fs');
var users = require('../lib/users.js');
var equip = require('../lib/equipment.js');
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
            app.post('/status/add',function(req,res){
                equip.addEquipStatus(req.body.status, function(result){
                       res.send(result);
                });
            });
            app.post('/status/get',function(req,res){
                equip.getEquipStatus('status_id',req.body.status_id,function(result){
                        res.send(result);
                    });
            });
            app.post('/status/update',function(req,res){
                equip.updateEquipStatus(req.body.status_id, 'status_id',req.body.status,function(result){
                    res.send(result);
                });
            });
            app.post('/status/delete',function(req,res){
                equip.deleteEquipStatus(req.body.status_id,function(result){
                    res.send(result);
                });
            });
            app.get('/status/list',function(req,res){
                equip.listEquipStatuses(function(result){
                    res.send(JSON.stringify(result));
                });
            });
            app.post('/type/add',function(req,res){
                equip.addEquipType(req.body.type, function(result){
                    res.send(result);
                });
            });
            app.post('/type/get',function(req,res){
                equip.getEquipType(req.body.id, function(result){
                    res.send(result);
                });
            });
            app.post('/type/delete',function(req,res){
                equip.deleteEquipType(req,body.id, function(result){
                    res.send(result);
                });
            });
            app.get('/type/list',function(req,res){
                equip.listEquipTypes(function(result){
                    res.send(result);
                });
            });
            app.post('/add',function(req,res){
                console.log(req.files);
                var obj = { "equip_id":null,
                            "type_id":req.body.type_id,
                            "make": req.body.make,
                            "model": req.body.model,
                            "description": req.body.description,
                            "image": fs.readFileSync(req.files.image.path) }
                equip.addEquipment(obj, function(result){
                    res.send(result);
                });
            });
            app.post('/get',function(req,res){
                equip.getEquipment(req.body.equip_id, function(result){

                    if(result.image != null) {
                        var image = result.image.toString('base64');
                    }else { var image = null;}

                    var obj = { "equip_id":result.equip_id,
                            "type_id":result.type_id,
                            "make": result.make,
                            "model": result.model,
                            "description": result.description,
                            "image": image
                            }
                    res.send(obj);
                });
            });
            app.post('/update',function(req,res){
                var obj = { "equip_id":req.body.equip_id,
                            "type_id":req.body.type_id,
                            "make": req.body.make,
                            "model": req.body.model,
                            "description": req.body.description,
                            "image": fs.readFileSync(req.files.image.path) }
                equip.updateEquipment(obj, function(result){
                    res.send(result);    
                });
            });
            app.post('/delete',function(req,res){
                equip.deleteEquipment(req.body.equip_id,function(result){
                    res.send(result);
                });
            });
            app.get('/list',function(req,res){
                equip.listEquipment(function(result){
                    res.send(result);
                });
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
