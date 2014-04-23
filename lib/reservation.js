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

exports.createReservation = function (r) {
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
           inserts = [null, r.reservation_id, r.user_id, r.reserv_date, r.reserv_edit_date,
                        r.reserv_start_date, r.reserv_end_date, r.reserv_status];

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
               cb(null);
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
                throw new Error(err);
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
                var eqitem = new equipment(results[0])
                cb(eqitem);
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
            var sql = 'SELECT * FROM reservation WHERE user_name = ?';
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

exports.getAvailableEquipment = function (variables) {

}

exports.reserveItem = function (variables) {

}

exports.unreserveItem = function (variables) {

}

exports.finalizeReservation = function (variables) {

}