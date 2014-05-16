//Load required libraries
var async = require('async');
var mysql = require('mysql');
var mail = require('./mailout.js');
var local = require('../local.config.js');
var mail_props = local.config.emails;
var messages = local.config.messages;

// Object Definitions
function reservation(reservdata) {
    this.reservation_id = reservdata.reservation_id;
    this.user_id = reservdata.user_id;
    this.reserv_date = reservdata.reserv_date;
    this.reserv_edit_date = reservdata.reserv_edit_date;
    this.reserv_start_date = reservdata.reserv_start_date;
    this.reserv_end_date = reservdata.reserv_end_date;
    this.reserv_status = reservdata.reserv_status;
}
reservation.prototype.id = null;
reservation.prototype.user_id = null;
reservation.prototype.reserv_date = new Date();
reservation.prototype.reserv_edit_date = new Date();
reservation.prototype.reserv_start_date = new Date();
reservation.prototype.reserv_end_date = new Date();
reservation.prototype.reserv_status = 1;

function reservedEquipment(reseqdata) {
    this.id = reseqdata.id;
    this.equipment_id = reseq.equipment_id;
    this.reservation_id = reseq.reservation_id;
}
reservedEquipment.id = null;
reservedEquipment.equipment_id = null;
reservedEquipment.reservation_id = null;

exports.createReservation = function (r, cb) {
    async.waterfall([
      //Acquire SQL connection from pool
       function (callback) {
           sql_pool.acquire(function (err, connection) {
               callback(err, connection);
           });
       },
      //Prepare and execute SQL
       function (connection, callback) {
           var sql, inserts;
           sql = 'INSERT INTO reservation VALUES(?,?,?,?,?,?,?)';
           inserts = [null, r.user_name, r.reserv_date, r.reserv_edit_date,
                        r.reserv_start_date, r.reserv_end_date, 5];

           sql = mysql.format(sql, inserts);

           connection.query(sql, function (err, results) {
               sql_pool.release(connection);
               callback(err, results);
           });
       },
       function (results) {
           if (results.length < 1) {
               cb(null);
           } else {
               cb(results.insertId);
           }
       }], function (err) {
                if (err) throw new Error(err);
           });
}

exports.updateReservation = function (r, cb) {
    async.waterfall([
        //Acquire SQL connection from pool
        function (callback) {
            sql_pool.acquire(function (err, connection) {
                callback(err, connection);
            });
        },
        //Update User Activation Status
        function (connection, callback) {
            var sql = 'UPDATE reservation SET reserv_edit_date = Now(), reserv_start_date = ?,\
                      reserv_end_date = ?, reserv_status = ? WHERE reservation_id = ?'

            var inserts = [r.reserv_start_date, r.reserv_end_date, r.reserv_status, r.reservation_id];
            sql = mysql.format(sql, inserts);

            connection.query(sql, function (err, results) {
                sql_pool.release(connection);
                cb(results)
            });
        }], function (err) {
               if(err) throw new Error(err);
        })
}

exports.listReservations = function (length, page, filter, cb) {
    async.waterfall([
        //Acquire SQL connection from pool
        function (callback) {
            sql_pool.acquire(function (err, connection) {
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function (connection, callback) {
            var sql = "SELECT * FROM reservation r INNER JOIN reservation_status s ON r.reserv_status = s.status_id \
                        WHERE user_name like '%" + filter + "%' OR status_description like '%" + filter + "%' \
                        OR reserv_start_date like '%" + filter + "%' OR reserv_end_date like '%" + filter + "%' \
                        ORDER BY reserv_start_date ASC LIMIT ?,?";

            var inserts = [(length * page), length];
            sql = mysql.format(sql, inserts);
            connection.query(sql, function (err, results) {
                sql_pool.release(connection);
                callback(err, results);
            });
        },
        function (results, callback) {
            if (results.length < 1) {
                cb(null);
            } else {
                var items = new Array();
                results.forEach(function (e) {
                    items.push(e);
                });
                cb(items);
            }
        }], function (err, results) {
            throw new Error(err);
        }
    )
}

exports.deleteReservation = function (id, cb) {
    async.waterfall([
                   //Acquire SQL connection from pool
                    function (callback) {
                        sql_pool.acquire(function (err, connection) {
                            callback(err, connection);
                        });
                    },
                    //Update User Activation Status
                    function (connection, callback) {
                        var sql = 'DELETE FROM reservation WHERE reservation_id = ?'
                        var inserts = [id];
                        sql = mysql.format(sql, inserts);
                        connection.query(sql, function (err, results) {
                            sql_pool.release(connection);
                            cb(results)
                        });
                    }
    ], function (err, result) {
        if (err) throw new Error(err);
    })
}

exports.getReservationById = function (id, cb) {
    async.waterfall([
        //Acquire SQL connection from pool
        function (callback) {
            sql_pool.acquire(function (err, connection) {
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function (connection, callback) {
            var sql = 'SELECT * FROM reservation WHERE reservation_id = ?';
            var inserts = [id];
            sql = mysql.format(sql, inserts);
            connection.query(sql, function (err, results) {
                sql_pool.release(connection);
                callback(err, results);
            });
        },
        function (results, callback) {
            if (results.length < 1) {
                cb(null);
            } else {
                cb(results[0]);
            }
        }], function (err, results) {
            throw new Error(err);
        }
    )
}

exports.getReservationsByStatus = function (status, cb) {
    async.waterfall([
        //Acquire SQL connection from pool
        function (callback) {
            sql_pool.acquire(function (err, connection) {
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function (connection, callback) {
            var sql = 'SELECT * FROM reservation WHERE reserv_status = ?';
            var inserts = [status];
            sql = mysql.format(sql, inserts);
            connection.query(sql, function (err, results) {
                sql_pool.release(connection);
                callback(err, results);
            });
        },
        function (results, callback) {
            if (results.length < 1) {
                cb(null);
            } else {
                var items = new Array();
                results.forEach(function (e) {
                    items.push(e);
                });
                cb(items);
            }
        }], function (err, results) {
            throw new Error(err);
        }
    )
}

exports.getReservationByUser = function (user_name, cb) {
    async.waterfall([
        //Acquire SQL connection from pool
        function (callback) {
            sql_pool.acquire(function (err, connection) {
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function (connection, callback) {
            var sql = 'SELECT * FROM equipreserv.reservation r \
                        INNER JOIN reservation_status s ON r.reserv_status = s.status_id \
                        INNER JOIN \
                          (SELECT reservation_id as rid, COUNT(inventory_id) as item_count \
                          FROM reserved_equipment GROUP BY reservation_id) as q \
                          ON r.reservation_id = q.rid \
                        WHERE reserv_end_date > now();'

            var inserts = [user_name];
            sql = mysql.format(sql, inserts);
            connection.query(sql, function (err, results) {
                sql_pool.release(connection);
                callback(err, results);
            });
        },
        function (results, callback) {
            if (results.length < 1) {
                cb(null);
            } else {
                var items = new Array();
                results.forEach(function (e) {
                    items.push(e);
                });
                cb(items);
            }
        }], function (err, results) {
            throw new Error(err);
        }
    )
}

exports.getReservationByDateRange = function (start, end, cb) {
    async.waterfall([
        //Acquire SQL connection from pool
        function (callback) {
            sql_pool.acquire(function (err, connection) {
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function (connection, callback) {
            var sql = 'SELECT * FROM reservation WHERE reserv_start_date BETWEEN ? AND ?';
            var inserts = [start, end];
            sql = mysql.format(sql, inserts);
            connection.query(sql, function (err, results) {
                sql_pool.release(connection);
                callback(err, results);
            });
        },
        function (results, callback) {
            if (results.length < 1) {
                cb(null);
            } else {
                var items = new Array();
                results.forEach(function (e) {
                    items.push(e);
                });
                cb(items);
            }
        }], function (err, results) {
            throw new Error(err);
        }
    )
}

exports.getAvailableEquipment = function (length, page, filter, start, end, cb) {
    /*Grab Equipment that is not currently reserved in the time period for the requested reserv.*/
    async.waterfall([
        //Acquire SQL connection from pool
        function (callback) {
            sql_pool.acquire(function (err, connection) {
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function (connection, callback) {
            var sql = 'SELECT \
                            equipment.equip_id,\
                            equip_type.type_desc,\
                            equipment.make,\
                            equipment.model,\
                            equipment.description,\
                            COUNT(eqdata.inventory_id) as available\
                            FROM equipment\
                            INNER JOIN (\
                                SELECT DISTINCT e.* FROM equip_item e\
                            LEFT JOIN\
                                    (\
                                        SELECT re.inventory_id \
                                        FROM \
                                            reserved_equipment re \
                                            INNER JOIN \
                                                reservation res \
                                                    ON re.reservation_id = res.reservation_id \
                                        WHERE \
                                            res.reserv_start_date \
                                                BETWEEN ? AND ? \
                                            or res.reserv_end_date BETWEEN ? AND ? \
                                        UNION ALL SELECT inventory_id FROM reserv_cart rc \
                                        WHERE rc.startdate BETWEEN ? AND ? OR rc.enddate BETWEEN ? AND ? \
				                )resitems \
                            ON e.inventory_id = resitems.inventory_id \
                            WHERE resitems.inventory_id IS NULL \
		                ) eqdata \
                            ON equipment.equip_id = eqdata.equip_id \
                            INNER JOIN equip_type \
                            ON equipment.type_id = equip_type.type_id \
                            WHERE \
                                equipment.equip_id like "%' + filter + '%" \
                                OR equip_type.type_desc like "%' + filter + '%" \
                                OR equipment.make like "%' + filter + '%" \
                                OR equipment.model like "%' + filter + '%" \
                                OR equipment.description like "%' + filter + '%" \
                            GROUP BY \
                            equipment.equip_id, \
                            equip_type.type_desc, \
                            equipment.make, \
                            equipment.model, \
                            equipment.description \
                            ORDER BY type_desc, make, model, equip_id LIMIT ?,?';
            
            var inserts = [start, end, start, end, start, end, start, end, (length * page), length];
            sql = mysql.format(sql, inserts);
            connection.query(sql, function (err, results) {
                sql_pool.release(connection);
                callback(err, results);
            });
        },
        function (results, callback) {
            if (results.length < 1) {
                cb(null);
            } else {
                var items = new Array();
                results.forEach(function (e) {
                    if (e.image) {
                        e.image = e.image.toString('base64');
                    }
                    items.push(e);
                });
                cb(items);
            }
        }], function (err, results) {
            throw new Error(err);
        }
    )
    
}

exports.addItemToCart = function (sess, item, start, end, cb) {
    async.waterfall([
        //GET SQL Connection
         function (callback) {
             sql_pool.acquire(function (err, connection) {
                 callback(err, connection);
             });
         },
         //Prepare & Execute SQL
         function (connection, callback) {
             //GET 1 ITEM FOR EQUIP_ID
             sql = 'SELECT \
                         eqdata.inventory_id \
                         FROM equipment\
                         INNER JOIN (\
                             SELECT DISTINCT e.* FROM equip_item e\
                         LEFT JOIN\
                         (\
                             SELECT re.inventory_id \
                             FROM \
                                 reserved_equipment re \
                                 INNER JOIN \
                                     reservation res \
                                         ON re.reservation_id = res.reservation_id \
                             WHERE \
                                 res.reserv_start_date \
                                     BETWEEN ? AND ? \
                                 or res.reserv_end_date BETWEEN ? AND ? \
                             UNION ALL SELECT inventory_id FROM reserv_cart rc \
                                        WHERE rc.startdate BETWEEN ? AND ? OR rc.enddate BETWEEN ? AND ? \
				                            )resitems \
                         ON e.inventory_id = resitems.inventory_id \
                         WHERE resitems.inventory_id IS NULL \
		                            ) eqdata \
                         ON equipment.equip_id = eqdata.equip_id \
                         INNER JOIN equip_type \
                         ON equipment.type_id = equip_type.type_id \
                         WHERE \
                         equipment.equip_id = ? \
                            LIMIT 1';
             inserts = [start, end, start, end, start, end, start, end, item];
             sql = mysql.format(sql, inserts);
             connection.query(sql, function (err, results) {
                if(err) throw new Error(err);
                sql_pool.release(connection);
                callback(err, results);
             });
         },
         //IF Item Write to Cart
         function (results, callback) {
             if (results[0]) {
                 inventory_id = results[0].inventory_id; 

                 sql_pool.acquire(function (err, connection) {
                     sql = 'INSERT INTO reserv_cart VALUES(?, ?, ?, ?, Now(), ?, ?)';
                     inserts = [null, sess, item, inventory_id, start, end];
                     sql = mysql.format(sql, inserts);
                     connection.query(sql, function (err, results) {
                         if(err) throw new Error(err);
                         sql_pool.release(connection);
                         cb(results);
                     });
                 });
             } else {
                 cb(null);
                 }
             },
             function (err, results) {
                 if (err) throw new Error(err);
             }
        ]);
}

exports.removeCartItem = function (id, cb) {
    async.waterfall([
        function (callback) {
            sql_pool.acquire(function (err, connection) {
                callback(err, connection)
            });
        },
        function (connection, callback) {
            sql = 'DELETE FROM reserv_cart WHERE inventory_id = ?';
            inserts = [id];
            sql = mysql.format(sql, inserts);
            connection.query(sql, function (err, results) {
                sql_pool.release(connection);
                cb(results);
            });
        },
        function (err, results) {
            if (err) throw new Error(err);
        }
    ])
}

exports.clearUserCart = function (user, cb) {
    async.waterfall([
        function (callback) {
            sql_pool.acquire(function (err, connection) {
                callback(err, connection)
            });
        },
        function (connection, callback) {
            sql = 'DELETE FROM reserv_cart WHERE sess_id = ?';
            inserts = [user];
            sql = mysql.format(sql, inserts);
            connection.query(sql, function (err, results) {
                sql_pool.release(connection);
                cb(results);
            });
        },
        function (err, results) {
            if (err) throw new Error(err);
        }
    ])
}


exports.getCartItemsByUser = function (user, cb) {
    async.waterfall([
        function (callback) { 
            sql_pool.acquire(function (err, connection) {
                callback(err, connection)
            });
        },
        function (connection, callback) { 
            sql = 'SELECT \
                        type_desc, make, model, inventory_id \
                    FROM \
                        reserv_cart c \
                    INNER JOIN \
                        equipment e ON e.equip_id = c.equip_id \
                    INNER JOIN \
                        equip_type t ON e.type_id = t.type_id \
                    WHERE sess_id = ? \
                    ORDER BY type_desc, make, model, inventory_id';

            inserts = [user];
            sql = mysql.format(sql, inserts);
            connection.query(sql, function (err, results) {
                sql_pool.release(connection);
                cb(results);
            });
        },
        function (err, results) {
            if(err) throw new Error(err);
        }
    ])
}

exports.startCartCollector = function () {
    if (typeof cartCollector === 'undefined') {
        console.log('Starting Collector');
        cartCollector = setInterval(clearExpiredItems, 10000);
    } else {
        console.log('No es carto collectero');
        return;
    }
}

clearExpiredItems = function () {
    async.waterfall([
        function (callback) {
            sql_pool.acquire(function (err, connection) {
                callback(err, connection)
            });
        },
        function (connection, callback) {
            sql = 'DELETE FROM reserv_cart \
                    WHERE sess_id IN( \
                        SELECT DISTINCT sess_id \
                        FROM \
                            (SELECT sess_id, max(timestamp) as maxtimestamp \
                            FROM reserv_cart \
                            ) as items \
                            WHERE TIMEDIFF(now(), maxtimestamp) > "00:05:00" ) '

            connection.query(sql, function (err, results) {
                sql_pool.release(connection);
                return;
            });
        },
        function (err, results) {
            if (err) throw new Error(err);
        }
    ])
}

exports.getCartTimerValue = function (user, cb) {
    async.waterfall([
        function (callback) { 
            sql_pool.acquire(function (err, connection) {
                callback(err, connection)
            });
        },
        function (connection, callback) { 
            sql = 'SELECT sess_id, MAX(timestamp) as timer FROM reserv_cart WHERE sess_id = ? GROUP BY sess_id';

            inserts = [user];
            sql = mysql.format(sql, inserts);
            connection.query(sql, function (err, results) {
                sql_pool.release(connection);
                cb(results);
            });
        },
        function (err, results) {
            if(err) throw new Error(err);
        }
    ])
}

exports.getEquipment = function(id, cb){
    async.waterfall([
        //Acquire SQL connection from pool
        function(callback){
            sql_pool.acquire(function(err, connection){
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function(connection, callback){
            var sql = 'SELECT * FROM equipment WHERE equip_id = ?';
            var inserts = [id];
            sql = mysql.format(sql,inserts);
            connection.query(sql, function(err, results) {
                sql_pool.release(connection);
                callback(err, results);   
            });
        },
        function (results, callback) {
            if(results.length < 1){
                cb(null);
            }else  {
               var eqitem = new equipment(results[0])  
               cb(eqitem);
            }
    }], function (err, results) {
            throw new Error(err);
        }
    )
};

exports.getEquipPic = function (id, cb) {
    async.waterfall([
        function (callback) {
            sql_pool.acquire( function (err, connection) {
                callback(err, connection);
            });
        },
        function (connection, callback) {
            sql = 'SELECT * from equipment WHERE equip_id = ?';
            inserts = [id];
            sql = mysql.format(sql, inserts);

            connection.query(sql, function (err, results) {
               sql_pool.release(connection);
               cb(results);
            });
        }]),

        function (err) {
            if (err) throw new Error(err);
        }
};

exports.finalizeCart = function (user, reservation_id, cb) {
    //Get all of the items in reserv_cart for this user.
    exports.getCartItemsByUser(user, function (result) {
        //Add those items to reserved_equipment (res_id, inv_id).
        result.forEach( function (value, index, arr) {
            exports.reserveItem(reservation_id, value.inventory_id);
        });

        //Delete all of those items from reserv_cart.
        exports.clearUserCart(user, function (result) {
            cb(result);
        });
    });
};

exports.reserveItem = function (reservation_id, inventory_id) {
    async.waterfall([
      //Acquire SQL connection from pool
       function (callback) {
           sql_pool.acquire(function (err, connection) {
               callback(err, connection);
           });
       },
      //Prepare and execute SQL
       function (connection, callback) {
           var sql, inserts;
           sql = 'INSERT INTO reserved_equipment VALUES(?,?,?)';
           inserts = [null, inventory_id, reservation_id];

           sql = mysql.format(sql, inserts);

           connection.query(sql, function (err, results) {
               sql_pool.release(connection);
               callback(err, results);
           });
       },
       function (results) {
           if (results.length < 1) {
               return false;
           } else {
               return true;
               //in the route get the details for the reserv and store the res info.  Then direct to add equip.
           }
       }], function (err) {
           if (err) throw new Error(err);
       });
}

exports.unreserveItem = function (reservation_id, inventory_id, cb) {
    async.waterfall([
                   //Acquire SQL connection from pool
                    function (callback) {
                        sql_pool.acquire(function (err, connection) {
                            callback(err, connection);
                        });
                    },
                    //Update User Activation Status
                    function (connection, callback) {
                        var sql = 'DELETE FROM reserved_equipment WHERE inventory_id = ?'
                        var inserts = [inventory_id];
                        sql = mysql.format(sql, inserts);
                        connection.query(sql, function (err, results) {
                            sql_pool.release(connection);
                            cb(results)
                        });
                    }
    ], function (err, result) {
        if (err) throw new Error(err);
    })
}

exports.getReservationEquipment = function (reservation_id, cb) {
    async.waterfall([
                   //Acquire SQL connection from pool
                    function (callback) {
                        sql_pool.acquire(function (err, connection) {
                            callback(err, connection);
                        });
                    },
                    //Update User Activation Status
                    function (connection, callback) {
                        var sql = 'SELECT \
                                    type_desc, make, model, r.inventory_id \
                                    FROM \
                                        reserved_equipment r \
                                    INNER JOIN \
                                        equip_item i ON r.inventory_id = i.inventory_id \
                                    INNER JOIN \
                                        equipment e ON e.equip_id = i.equip_id \
                                    INNER JOIN \
                                        equip_type t ON e.type_id = t.type_id \
                                    WHERE reservation_id = ? \
                                    ORDER BY type_desc, make, model, r.inventory_id';

                        var inserts = [reservation_id];
                        sql = mysql.format(sql, inserts);
                        connection.query(sql, function (err, results) {

                            sql_pool.release(connection);
                            cb(results)
                        });
                    }
    ], function (err, result) {
        if (err) throw new Error(err);
    })
}