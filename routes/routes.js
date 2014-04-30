var fs = require('fs');
var async = require('async');
var users = require('../lib/users.js');
var equip = require('../lib/equipment.js');
var reserv = require('../lib/reservation.js');
var local = require('../local.config.js');
var messages = local.config.messages;

//FUNCTIONS
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

//APPLICATION ROUTING
module.exports = function(app){

    //USER ACCOUNTS
    app.namespace('/users', function(req, res) {
        //User Authentication
        app.post('/authenticate',function(req,res) {
            users.authenticate(req, res)
              });
         //Add New User
        app.post('/register',function(req,res) {
            users.getByUsername(req.body.user_name, function(result){
                if(result){
                    res.render('./users/register',{message: messages.username_exists});
                } else {
                    users.getByEmail(req.body.email, function(result){
                        if(result){
                            res.render('./users/register',{message: messages.email_exists});
                        } else {
                            users.register(req, res)
                        }
                    });
                }
            });
                
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
    });
  
    //EQUIPMENT ADMINISTRATION
    app.namespace('/admin',isLoggedIn,isAdmin,function() {
        //EQUIPMENT NAMESPACE
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
                    res.send(result);
                });
            });
            app.get('/status/new',function(req,res){
                res.render('./equipment/equipment',{user: req.session.thisUser});
            });
            app.post('/type/add',function(req,res){
                equip.addEquipType(req.body.type, function(result){
                    if(!result){
                        res.render('./equipment/equipment',{user: req.session.thisUser, message: messages.itemexists});
                    }
                    else {
                        res.render('./equipment/equipment',{user: req.session.thisUser, message: messages.itemadded});
                        }
                });
            });
            app.post('/type/get',function(req,res){
                equip.getEquipType(req.body.type_id, function(result){
                    res.send(result);
                });
            });
            app.post('/type/delete',function(req,res){
                equip.deleteEquipType(req.body.type_id, function(result){
                    res.send(result);
                });
            });
            app.get('type/list', function (req, res) {
                equip.listEquipTypes(function (result) {
                    res.send(result);
                });
            });
            app.get('type/list2', function (req, res) {
                length = parseInt(req.query.length);
                page = parseInt(req.query.page);
                filter = req.query.filter;
                equip.listEquipTypes2(length, page, filter, function (result) {
                    res.send(result);
                });
            });
            app.get('type/view', function (req, res) {
                res.render('./equipment/typelist', { user: req.session.thisUser });
            });
            app.get('/type/new',function(req,res){
                res.render('./equipment/equipment',{user: req.session.thisUser});
            });
            app.post('/type/update', function (req, res) {
                equip.updateEquipType(req.body.type_id, req.body.type_desc, function (result) {
                    res.render('./equipment/typelist', { user: req.session.thisUser});
                });
            });
            app.post('/add',function(req,res){
                if(fs.statSync(req.files.image.path)["size"] >= 16777215) {
                    res.render('./equipment/equipment',{user: req.session.thisUser, message: messages.filetoobig});
                    }
                var obj = { "equip_id":null,
                            "type_id":req.body.type,
                            "make": req.body.make,
                            "model": req.body.model,
                            "description": req.body.description,
                            "image": fs.readFileSync(req.files.image.path) 
                            }
                equip.addEquipment(obj, function(result){
                    if(!result){
                        res.render('./equipment/equiplist',{user: req.session.thisUser, message: messages.itemexists});
                    } else {
                        res.render('./equipment/equiplist',{user: req.session.thisUser, message: messages.itemadded});
                    }
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
                length = parseInt(req.query.length);
                page = parseInt(req.query.page);
                filter = req.query.filter;
                equip.listEquipment(length, page, filter, function(result){
                    res.send(result);
                });
            });
            app.get('/viewinventory',function(req,res){
                res.render('./equipment/inventory',{user: req.session.thisUser});
            });
            app.get('/view',function(req,res){
                res.render('./equipment/equiplist',{user: req.session.thisUser});
            });
            app.get('/new',function(req,res){
                res.render('./equipment/equipment',{user: req.session.thisUser});
            });
            app.post('/item/add',function(req,res){
                var equip_id = req.body.equip_id;
                async.each(Object.keys(req.body), function(item, callback) {
                    if(item != 'equip_id') {
                        equip.addEquipItem(req.body[item], equip_id, callback);
                    } else {
                        callback();
                        }
                },
                function(err){
                    try {
                        res.redirect(302,req.headers['referer']); 
                        }catch(e) {
                            res.send(messages.generic_error);
                        }
                });
            });
            app.post('/item/get',function(req,res){
                equip.getEquipItem(req.body.inventory_id,function(result){
                    res.send(result);
                });
            });
            app.post('/item/update',function(req,res){
                equip.updateEquipItem(req.body,function(result){
                    res.send(result);
                });
            });
            app.post('/item/delete',function(req,res){
                equip.deleteEquipItem(req.body.inventory_id,function(result){
                    res.send(result);
                });
            });
            app.get('/item/list',function(req,res){
                equip.listEquipItems(function(result){
                    res.send(result);
                });
            });
            app.get('/item/inventory',function(req,res){
                var equip_id = parseInt(req.query.eid);
                var length = parseInt(req.query.length);
                var page = parseInt(req.query.page);
                var filter = req.query.filter;
                if(!equip_id) {
                    equip.listEquipItems(length, page, filter, function(result){
                        res.send(result);
                });
                } else {
                    equip.listSelectItems(equip_id, length, page, filter, function(result){
                        res.send(result);
                });
                }
            });
            app.get('/item/new',function(req,res){
                res.render('./equipment/equipment',{user: req.session.thisUser});
            });
        });//end admin/equipment namespace

        app.namespace('/users', function() {
            app.get('/', function(req, res) {
                res.render('./users/userlist',{user: req.session.thisUser});
            });
            app.get('/list', function(req, res) {
                length = parseInt(req.query.length);
                page = parseInt(req.query.page);
                filter = req.query.filter;
                users.listUsers(length, page, filter, function(result){
                    res.send(result);
                });
            });
            app.post('/get', function(req, res) {
                users.getByUsername(req.body.user_name, function(result){
                    res.send(result);
                });
            });
            app.post('/update', function (req, res) {
                users.adminUpdate(req, function (result) {
                    if (!result.affectedRows == 1) {
                        res.render('./users/userlist', { message: messages.noupdate, user: req.session.thisUser });
                    } else {
                        res.render('./users/userlist', { message: messages.accountupdated, user: req.session.thisUser });
                    }
                });
            });
            app.post('/delete', function (req, res) {
                users.deleteUser(req.body.user_name, function (result) {
                    res.send(result);
                });

            });

        });//end admin/users namespace

    });

    //RESERVATION API
    app.namespace('/reservation', isLoggedIn, function () {

        //ADD RESERVATION
        app.post('/add', function (req, res) {
            newres = {
                user_name: req.session.thisUser.user_name,
                reserv_date: new Date(),
                reserv_edit_date: new Date(),
                reserv_start_date: req.body.start,
                reserv_end_date: req.body.end
            }

            reserv.createReservation(newres, function (result) {
                res.send('Your reservation ID is: ' + result);
            });
        });

        app.post('/update', function (req, res) {
            newres = {
                reservation_id : req.body.reservation_id,
                reserv_start_date : req.body.start,
                reserv_end_date: req.body.end,
                reserv_status: parseInt(req.body.reserv_status)
            }
            reserv.updateReservation(newres, function (result) {
                res.send(result);
            });
        });

        app.post('/list', function (req, res) {
            length = parseInt(req.body.length);
            page = parseInt(req.body.page);
            filter = req.body.filter;

            reserv.listReservations(length, page, filter, function (result) {
                res.send(result);
            });
        });
        app.get('/list', function (req, res) {
            length = parseInt(req.query.length);
            page = parseInt(req.query.page);
            filter = req.query.filter;

            reserv.listReservations(length, page, filter, function (result) {
                res.send(result);
            });
        });
        app.post('/delete', function (req, res) {
            reserv.deleteReservation(req.body.reservation_id, function (result) {
                res.send(result);
            });
        });
        app.post('/get', function (req, res) {

            if (req.body.reservation_id) {
                reserv.getReservationById(req.body.reservation_id, function (result) {
                    res.send(result);
                });
            } 
            else if (req.body.status) {
                reserv.getReservationsByStatus(req.body.status, function (result) {
                    res.send(result);
                });
            }
            else if (req.body.user_name) {
                reserv.getReservationByUser(req.body.user_name, function (result) {
                    res.send(result);
                });
            }
            else if (req.body.start && req.body.end) {
                reserv.getReservationByDateRange(req.body.start, req.body.end, function (result) {
                    res.send(result);
                });
            }
            else {
                res.send(200, 'Huh?');
            }
        });

        app.post('/getavailableequipment', function (req, res) {
            start = new Date(req.body.start);
            end = new Date(req.body.end);
            type = req.body.type;

            reserv.getAvailableEquipment(start, end, type, function (result) {
                res.send(result);
            });
        });

        app.post('/reserveitem', function (req, res) {
            reserv.reserveItem(req.body.reservation_id, req.body.inventory_id, function (result) {
                res.send(200, "Your item has been reserved as number: " + result);
            });
        });

        app.post('/unreserveitem', function (req, res) {
            reserv.unreserveItem(req.body.reservation_id, req.body.inventory_id, function (result) {
                res.send(result);
            });
        });
    });

    //USER EXPERIENCE
    app.namespace('/reservation/user', isLoggedIn, function () {

        app.get('/home', function (req, res) {
            res.render('./reservation/user/userhome', { user: req.session.thisUser });
        });

    });

    //ADMIN EXPERIENCE
    app.namespace('/reservation/admin', isLoggedIn, function () {

    });
       
    //Create Error Response - No Route Exists
    app.all('*', function(req, res){
        res.render('./users/login');
    });
}
