var fs = require('fs');
var async = require('async');
var users = require('../lib/users.js');
var equip = require('../lib/equipment.js');
var reserv = require('../lib/reservation.js');
var mailout = require('../lib/mailout.js');
var local = require('../local.config.js');
var messages = local.config.messages;
var title = local.config.hostconfig.app_title;

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
            res.render('./reservation/user/home',{user: req.session.thisUser, message: messages.notadmin, title: title});
        }
}

//APPLICATION ROUTING
module.exports = function(app){

    //USER ACCOUNTS
    app.namespace('/users', function (req, res) {

        //Error if no javascript
        app.get('/javascriptdisabled', function (req, res) {
            res.render('nojavascript', {title: title});
        });

        //User Authentication
        app.post('/authenticate',function (req,res) {
            if (req.body.user_name && req.body.password) {
                users.authenticate(req, res)
            } else res.send('525', 'Request Invalid, Missing Information');
              });
        
         //Add New User
        app.post('/register',function (req,res) {
            users.getByUsername(req.body.user_name, function(result){
                if(result){
                    res.render('./users/register',{message: messages.username_exists, title: title});
                } else {
                    users.getByEmail(req.body.email, function(result){
                        if(result){
                            res.render('./users/register',{message: messages.email_exists, title: title});
                        } else {
                            users.register(req, res)
                        }
                    });
                }
            });
                
        });
         //User Registration Form
        app.get('/register',function (req,res) {
            res.render('./users/register', {title: title});
        });
        //User Activation
        app.get('/activate',function (req,res){
            if (req.query.id) users.activate(req,res);
            else res.send('525', 'Request Invalid, Missing Information');
        });
        //resend activation email
        app.get('/resendactivate',function (req,res){
            if (req.session.inactiveUser) {
                var inactiveUser = req.session.inactiveUser;
                users.sendActivationLink(inactiveUser.hash, inactiveUser.email);
                res.render('./users/login',{resendactivate: messages.resend_activate, title: title});
            } else res.send('525', 'Request Invalid, Missing Information');
        });
        //update user account
        app.post('/update',isLoggedIn, function (req,res){
               users.update(req,res);
        });
        //logout user
        app.get('/logout',isLoggedIn, function (req,res){
            users.logOut(req,res);
        });
        //Send password reset link
        app.post('/forgotpassword',function (req,res){
            if(req.body.email) users.recoverPassword(req, res);
            else res.send('525', 'Request Invalid, Missing Information');
        });
        //Render contact form
        app.get('/sendmessage', function (req, res) {
            res.render('contact',{user: req.session.thisUser, title: title});
        });
        //Send contact message to admin.
        app.post('/sendmessage',function(req,res){
            if(req.body.email && req.body.subject && req.body.message) {
                users.sendMessage(req.body);
                res.render('contact', {user: req.session.thisUser, message: messages.messagesubmitted, title: title});
            } else res.send('525', 'Request Invalid, Missing Information');
        });
        //User followed reset password link
        app.get('/resetpassword',function(req,res){
            if(!req.query.id) {
                res.send('525', 'Request Invalid, Missing Information');
            } else 
                {users.getByHash(req.query.id,function(user){
                    if(user === null){res.render('./users/login',{message: messages.reset_link_expired, title: title});}
                    else {
                        
                            req.session.thisUser = user;
                            res.render('./users/resetpass',{user: user, title: title});
                    }
                })
            }
        });

        app.post('/resetpass', function (req, res) {
            if(req.session.thisUser) users.resetPassword(req, res);
            else res.send('525', 'Request Invalid, Missing Information');
        });

        //User Account View
        app.get('/account',isLoggedIn,function(req,res){
            res.render('./users/account',{user: req.session.thisUser, title: title});
        });
        //Change Password
        app.get('/changepass',isLoggedIn,function(req,res){
            res.render('./users/account',{user: req.session.thisUser, title: title});
        });
        app.post('/changepass',isLoggedIn,function(req,res){
            users.changePassword(req,res);
        });
        //Default
        app.get('/',function(req,res){
            res.render('./users/login', {title: title});
        });
    });
  
    //EQUIPMENT ADMINISTRATION
    app.namespace('/admin',isLoggedIn,isAdmin,function() {
        //EQUIPMENT NAMESPACE
        app.namespace('/equipment', function() {
            app.get('/',function(req,res){
                res.render('./equipment/equipment',{user: req.session.thisUser, title: title});
            });
            /*
            app.post('/status/add',function(req,res){
                if (req.body.status) {
                    equip.addEquipStatus(req.body.status, function(result){
                           res.send(result);
                    });
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.post('/status/get',function(req,res){
                if (req.body.status_id) {
                    equip.getEquipStatus('status_id',req.body.status_id,function(result){
                        res.send(result);
                    }); 
                } else res.send('525', 'Request Invalid, Missing Information');
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
            }); */
            app.post('/type/add',function(req,res){
                if (req.body.type) {
                    equip.addEquipType(req.body.type, function(result){
                        if(!result){
                            res.render('./equipment/typelist',{user: req.session.thisUser, message: messages.itemexists, title: title});
                        }
                        else {
                            res.render('./equipment/typelist',{user: req.session.thisUser, message: messages.itemadded, title: title});
                            }
                    });
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.post('/type/get',function(req,res){
                if (req.body.type_id) {
                    equip.getEquipType(req.body.type_id, function(result){
                        res.send(result);
                    });
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.post('/type/delete',function(req,res){
                if (req.body.type_id) {
                    equip.deleteEquipType(req.body.type_id, function(result){
                        res.send(result);
                    });
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.get('type/list', function (req, res) {
                equip.listEquipTypes(function (result) {
                    res.send(result);
                });
            });
            app.get('type/list2', function (req, res) {
                if (req.query.length && req.query.page) {
                    length = parseInt(req.query.length) || 0;
                    page = parseInt(req.query.page) || 0;
                    filter = req.query.filter;
                    equip.listEquipTypes2(length, page, filter, function (result) {
                        res.send(result);
                    });
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.get('type/view', function (req, res) {
                res.render('./equipment/typelist', { user: req.session.thisUser, title: title });
            });
            app.get('/type/new',function(req,res){
                res.render('./equipment/equipment',{user: req.session.thisUser, title: title});
            });
            app.post('/type/update', function (req, res) {
                if (req.body.type_id && req.body.type_desc) {
                    equip.updateEquipType(req.body.type_id, req.body.type_desc, function (result) {
                        res.render('./equipment/typelist', { user: req.session.thisUser, title: title});
                    });
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.post('/add',function(req,res){
                if (req.body.type && req.body.make && req.body.model) {
                    if (req.files.image) {
                        var imagefile = fs.readFileSync(req.files.image.path);

                        if(fs.statSync(req.files.image.path)["size"] >= 3145728) {
                            console.log('File uploaded to %s', req.files.image.path);
                            res.render('./equipment/equipment',{user: req.session.thisUser, message: messages.filetoobig, title: title});
                            } 
                        }
                        var obj = { "equip_id":null,
                                    "type_id":req.body.type,
                                    "make": req.body.make,
                                    "model": req.body.model,
                                    "description": req.body.description,
                                    "image": imagefile || null 
                                    }
                        equip.addEquipment(obj, function(result){
                            if(!result){
                                res.render('./equipment/equipment',{user: req.session.thisUser, message: messages.itemexists, title: title});
                            } else {
                                res.render('./equipment/equipment',{user: req.session.thisUser, message: messages.itemadded, title: title});
                            }
                        });
                            
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.post('/get',function(req,res){
                if (req.body.equip_id) {
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
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.post('/update',function(req,res){
                if (req.body.equip_id && req.body.type_id && req.body.make && req.body.model) {
                    if (req.files.image) {
                        var imagefile = fs.readFileSync(req.files.image.path);
                        if(fs.statSync(req.files.image.path)["size"] >= 3145728) {
                            console.log('File uploaded to %s', req.files.image.path);
                            res.render('./equipment/equipment',{user: req.session.thisUser, message: messages.filetoobig, title: title});
                        }
                    }
                    var obj = { "equip_id":req.body.equip_id,
                                "type_id":req.body.type_id,
                                "make": req.body.make,
                                "model": req.body.model,
                                "description": req.body.description,
                                "image": imagefile || null 
                            }

                    equip.updateEquipment(obj, function(result){
                        res.render('./equipment/equipment',{user: req.session.thisUser, title: title})    
                    });
                        
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.post('/delete',function(req,res){
                if (req.body.equip_id) {
                    reserv.isEquipmentReserved(req.body.equip_id, function(result) {

                        if (result) {

                            res.send(523, 'Cannot delete reserved items.');

                        } else {

                            equip.deleteEquipment(req.body.equip_id,function(result){
                                res.send(result);
                            });
                        }
                    });
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.get('/list',function(req,res){
                if (req.query.length && req.query.page) {
                    length = parseInt(req.query.length) || 0;
                    page = parseInt(req.query.page) || 0;
                    filter = req.query.filter;
                    equip.listEquipment(length, page, filter, function(result){
                        res.send(result);
                    });
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.get('/viewinventory',function(req,res){
                res.render('./equipment/inventory',{user: req.session.thisUser, title: title});
            });
            app.get('/view',function(req,res){
                res.render('./equipment/equipment',{user: req.session.thisUser, title: title});
            });
            app.get('/new',function(req,res){
                res.render('./equipment/equipment',{user: req.session.thisUser, title: title});
            });
            app.post('/item/add',function(req,res){
                if (req.body.equip_id) {
                    var equip_id = req.body.equip_id;
                    
                    async.each(Object.keys(req.body), function(item, callback) {
                        if(item != 'equip_id' && req.body[item] != "") {
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
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.post('/item/get',function(req,res){
                if (req.body.inventory_id) {
                    equip.getEquipItem(req.body.inventory_id,function(result){
                        res.send(result);
                    });
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.post('/item/update',function(req,res){
                if (req.body.inventory_id && req.body.equip_id && req.body.item_status) {
                    equip.updateEquipItem(req.body,function(result){
                        res.send(result);
                    });
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.post('/item/delete',function(req,res){
                if (req.body.inventory_id) {
                    reserv.isInventoryReserved(req.body.inventory_id, function(result) {

                        if (result) {

                            async.eachSeries(result, reserv.swapReservedItem, function (err, results) {
                                if(err) {

                                    if(err.message == 'No Inventory!'){
                                        res.send(523, 'Item cannot be deleted.');
                                    } else {

                                        throw new Error(JSON.stringify(err));
                                    }

                                } else {

                                    equip.deleteEquipItem(req.body.inventory_id,function(result){
                                        res.send(result);
                                    });
                                }
                            });
                        
                        } else {

                            equip.deleteEquipItem(req.body.inventory_id, function(result){
                            res.send(result);
                            });
                        }
                    });
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.get('/item/list',function(req,res){
                equip.listEquipItems(function(result){
                    res.send(result);
                });
            });
            app.get('/item/inventory',function(req,res){
                if (req.query.eid && req.query.length && req.query.page) {
                    var equip_id = parseInt(req.query.eid) || 0;
                    var length = parseInt(req.query.length) || 0;
                    var page = parseInt(req.query.page) || 0;
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
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.get('/item/new',function(req,res){
                res.render('./equipment/equipment',{user: req.session.thisUser, title: title});
            });
        });//end admin/equipment namespace

        app.namespace('/users', function() {
            app.get('/', function(req, res) {
                res.render('./users/userlist',{user: req.session.thisUser, title: title});
            });
            app.get('/list', function(req, res) {
                if (req.query.length && req.query.page) {
                    length = parseInt(req.query.length) || 0;
                    page = parseInt(req.query.page) || 0;
                    filter = req.query.filter;
                    users.listUsers(length, page, filter, function(result){
                        res.send(result);
                    });
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.post('/get', function(req, res) {
                if (req.body.user_name) {
                    users.getByUsername(req.body.user_name, function(result){
                        res.send(result);
                    });
                } else res.send('525', 'Request Invalid, Missing Information');
            });
            app.post('/update', function (req, res) {
                if (req.body.user_name && req.body.first_name && req.body.last_name &&
                    req.body.email && req.body.user_level && req.body.activated) {
                        users.adminUpdate(req, function (result) {
                            if (!result.affectedRows == 1) {
                                res.render('./users/userlist', { message: messages.noupdate, user: req.session.thisUser, title: title });
                            } else {
                                res.render('./users/userlist', { message: messages.accountupdated, user: req.session.thisUser, title: title });
                            }
                        });
                } else res.send('525', 'Request Invalid, Missing Information');
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
            var today = new Date();
            var startdate = new Date(req.body.start);
            var enddate = new Date(req.body.end);

            if ( isNaN(startdate.getTime()) ) startdate = today;
            if ( isNaN(enddate.getTime()) ) enddate = today;

            newres = {
                user_name: req.session.thisUser.user_name,
                reserv_date: today,
                reserv_edit_date: today,
                reserv_start_date: startdate,
                reserv_end_date: enddate
            }
            
            reserv.createReservation(newres, function (result) {
                if (result) {
                    reserv.finalizeCart(req.session.thisUser.user_name, result, function (result) {
                        res.send(result);
                    });
                }
            });
        });

        app.post('/updatestatus', function (req, res) {
            if (req.body.reservation_id && req.body.reserv_status) {
                if (req.session.thisUser.user_level == -1 ) {
                    reserv.updateReservationStatus(req.body.reservation_id, req.body.reserv_status, function (result) {
                        res.send(result);
                    });
                } else {
                    reserv.getUserForReservation(req.body.reservation_id, function (result) {
                        if (result.user_name == req.session.thisUser.user_name) {

                            reserv.updateReservationStatus(req.body.reservation_id, req.body.reserv_status, function (result) {
                                res.send(result);
                            });
                        } else {
                            res.send(524, "This is not your reservation.")
                        }
                    });
                }
            } else res.send('525', 'Request Invalid, Missing Information');
            
        });

        /*app.post('/list', function (req, res) {
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
        });*/

        app.get('/getavailableequipment', function (req, res) {
            length = parseInt(req.query.length) || 0;
            page = parseInt(req.query.page) || 0;
            filter = req.query.filter;
            start = req.query.start;
            end = req.query.end;

            reserv.getAvailableEquipment(length, page, filter, start, end, function (result) {
                res.send(result);
            });
        });

        app.post('/reserveitem', function (req, res) {
            if (req.body.reservation_id && req.body.inventory_id) {
                if (req.session.thisUser.user_level == -1 ) {

                    reserv.reserveItem(req.body.reservation_id, req.body.inventory_id, function (result) {
                        res.send(200, "Your item has been reserved as number: " + result);
                    });


                } else {
                    reserv.getUserForReservation(req.body.reservation_id, function (result) {
                        if (result.user_name == req.session.thisUser.user_name) {

                            reserv.reserveItem(req.body.reservation_id, req.body.inventory_id, function (result) {
                                res.send(200, "Your item has been reserved as number: " + result);
                            });

                        } else {
                            res.send(524, "This is not your reservation.")
                        }
                    });
                }
            } else res.send('525', 'Request Invalid, Missing Information');
        });

        app.post('/unreserveitem', function (req, res) {
            if (req.body.reservation_id && req.body.inventory_id) {
                if (req.session.thisUser.user_level == -1 ) {

                    reserv.unreserveItem(req.body.reservation_id, req.body.inventory_id, function (result) {
                        res.send(result);
                    });


                } else {
                    reserv.getUserForReservation(req.body.reservation_id, function (result) {
                        if (result.user_name == req.session.thisUser.user_name) {

                            reserv.unreserveItem(req.body.reservation_id, req.body.inventory_id, function (result) {
                                res.send(result);
                            });

                        } else {
                            res.send(524, "This is not your reservation.")
                        }
                    });
                }
            } else res.send('525', 'Request Invalid, Missing Information');
            
        });
    });

    //USER EXPERIENCE
    app.namespace('/reservation/user', isLoggedIn, function () {

        app.get('/home', function (req, res) {
            res.render('./reservation/user/home', { user: req.session.thisUser, title: title });
        });

        app.post('/addcart', function (req, res) {
            if (req.body.equip_id) {
                start = new Date(req.body.start);
                end = new Date(req.body.end);

                if ( isNaN( start.getTime()) ) start = new Date();
                if ( isNaN( end.getTime() ) ) end = new Date();

                reserv.addItemToCart(req.session.thisUser.user_name, req.body.equip_id, start, end, function (result) {
                    res.send(result);
                });
            } else res.send('525', 'Request Invalid, Missing Information');
        });

        app.get('/clearcart', function (req, res) {
            reserv.clearUserCart(req.session.thisUser.user_name, function(result) {
                res.send(result);
            });
        });

        app.get('/getcartitems', function (req, res) {
            reserv.getCartItemsByUser(req.session.thisUser.user_name, function(result) {
                res.send(result);
            });
        });

        app.get('/carttimer', function (req, res) {
            reserv.getCartTimerValue(req.session.thisUser.user_name, function(result) {
                res.send(result);
            });
        });
        
        app.post('/delcartitem', function (req, res) {
            if (req.body.inventory_id) {
                reserv.removeCartItem(req.body.inventory_id, req.session.thisUser.user_name, function(result) {
                    res.send(result);
                });
            } else res.send('525', 'Request Invalid, Missing Information');
        });

        app.post('/getequipdetail',function(req,res){
            if (req.body.equip_id) {
                reserv.getEquipment(req.body.equip_id, function(result){

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
            } else res.send('525', 'Request Invalid, Missing Information');
        });

        app.get('/getequippic', function (req, res) {
            if (req.query.equip_id) {

                reserv.getEquipPic(req.query.equip_id, function (result) {

                    if(result) {
                        
                        var result = result[0];

                        if(result.image != null) {
                                var image = result.image.toString('base64');
                        } else { var image = null; }

                             var obj = { "equip_id" : result.equip_id,
                                    "type_id" : result.type_id,
                                    "make" : result.make,
                                    "model" : result.model,
                                    "description" : result.description,
                                    "image" : image
                                    }

                            res.send(obj);

                        } else {res.send(null);}
                });
            } else res.send('525', 'Request Invalid, Missing Information');
        });

        app.get('/list', function(req,res) {
            reserv.getReservationByUser(req.session.thisUser.user_name, function(result) {
                res.send(result);
            });
        });

        app.get('/getresequipment', function (req, res) {
            if (req.query.reservation_id) {
                reserv.getReservationEquipment(req.query.reservation_id, function (result) {
                    res.send(result);
                });
            } else res.send('525', 'Request Invalid, Missing Information');
        });


    });

    //ADMIN
    app.namespace('/reservation/admin', isLoggedIn, isAdmin, function () {
        app.get('/home', function (req, res) {
            res.render('./reservation/admin/pending', {user: req.session.thisUser, title: title});
        });

        app.get('/pending', function (req, res) {
            res.render('./reservation/admin/pending', {user: req.session.thisUser, title: title});
        });

        app.get('/todays', function (req, res) {
            res.render('./reservation/admin/todays', {user: req.session.thisUser, title: title});
        });

        app.get('/late', function (req, res) {
            res.render('./reservation/admin/late', {user: req.session.thisUser, title: title});
        });

        app.get('/active', function (req, res) {
            res.render('./reservation/admin/active', {user: req.session.thisUser, title: title});
        });

        app.get('/all', function (req, res) {
            res.render('./reservation/admin/all', {user: req.session.thisUser, title: title});
        });

        app.get('/getpending', function (req, res) {
            length = parseInt(req.query.length) || 0;
            page = parseInt(req.query.page) || 0;
            filter = req.query.filter;
            reserv.listPendingReservations(length, page, filter, function(result) {
                res.send(result);
            });
        });

        app.get('/gettodays', function (req, res) {
            length = parseInt(req.query.length) || 0;
            page = parseInt(req.query.page) || 0;
            filter = req.query.filter;
            reserv.listTodaysReservations(length, page, filter, function(result) {
                res.send(result);
            });
        });

        app.get('/getlate', function (req, res) {
            length = parseInt(req.query.length) || 0;
            page = parseInt(req.query.page) || 0;
            filter = req.query.filter;
            reserv.listLateReservations(length, page, filter, function(result) {
                res.send(result);
            });
        });

        app.get('/getactive', function (req, res) {
            length = parseInt(req.query.length) || 0;
            page = parseInt(req.query.page) || 0;
            filter = req.query.filter;
            reserv.listActiveReservations(length, page, filter, function(result) {
                res.send(result);
            });
        });

        app.get('/getall', function (req, res) {
            length = parseInt(req.query.length) || 0;
            page = parseInt(req.query.page) || 0;
            filter = req.query.filter;
            reserv.listAllReservations(length, page, filter, function(result) {
                res.send(result);
            });
        });

        app.post('/approvereservation', function (req, res) {
            if (req.body.reservation_id) {
                reserv.updateReservationStatus(req.body.reservation_id, 7, function(result){
                    res.send(result);
                });
            } else res.send('525', 'Request Invalid, Missing Information');
        });

        app.post('/cancelreservation', function (req, res) {
            if (req.body.reservation_id) {
                reserv.updateReservationStatus(req.body.reservation_id, 3, function(result){
                    res.send(result);
                });
            } else res.send('525', 'Request Invalid, Missing Information');
        });

        app.post('/rejectreservation', function (req, res) {
            if (req.body.reservation_id) {
                reserv.updateReservationStatus(req.body.reservation_id, 1, function(result){
                    res.send(result);
                });
            } else res.send('525', 'Request Invalid, Missing Information');
        });

        app.post('/completereservation', function (req, res) {
            if (req.body.reservation_id) {
                reserv.updateReservationStatus(req.body.reservation_id, 4, function(result){
                    res.send(result);
                });
            } else res.send('525', 'Request Invalid, Missing Information');
        });

        app.post('/startreservation', function (req, res) {
            if (req.body.reservation_id) {
                reserv.updateReservationStatus(req.body.reservation_id, 2, function(result){
                    res.send(result);
                });
            } else res.send('525', 'Request Invalid, Missing Information');
        });
        app.get('/printcontract', function (req, res) {
           
                res.render('./reservation/admin/usercontract', 
                    {company: local.config.hostconfig.company_name, title: title}
                );
        });
        app.post('/getcontractdata', function (req, res) {
            if (req.body.reservation_id) {
                 reserv.getContractData(req.body.reservation_id, function (results) {
                    res.send(results);
                 });
             } else res.send('525', 'Request Invalid, Missing Information');
        });
    });
       
    //Create Error Response - No Route Exists
    app.all('*', function(req, res){
        res.render('./users/login', {title: title});
    });
}
