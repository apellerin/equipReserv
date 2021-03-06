﻿    //Load required libraries
var async = require('async');
var mysql = require('mysql');
var mail = require('./mailout.js');
var local = require('../local.config.js');
var mail_props = local.config.emails;
var messages = local.config.messages;

// Object Definitions
//Equipment Statuses
function equip_status(status_data) {
    this.status_id = status_data.status_id;
    this.status = status_data.status_desc;
}
//Prototype
equip_status.prototype.status_id = null;
equip_status.prototype.status = null;

//Equipment Types
function equip_type(type_data) {
    this.type_id = type_data.type_id;
    this.type_desc = type_data.type_desc;
}
//Prototype
equip_type.prototype.type_id = null;
equip_type.prototype.type_data = null;

//Equipment
function equipment(equip_data) {
    'use strict';
    this.equip_id = equip_data.equip_id;
    this.type_id = equip_data.type_id;
    this.make = equip_data.make;
    this.model = equip_data.model;
    this.description = equip_data.description;
    this.image = equip_data.image;
}
//Prototype
equipment.prototype.equip_id = null;
equipment.prototype.type_id = null;
equipment.prototype.make = null;
equipment.prototype.model = null;
equipment.prototype.description = null;
equipment.prototype.image = null;

//Equipment Item
function equip_item(item_data) {
    this.inventory_id = item_data.inventory_id;
    this.equip_id = item_data.equip_id;
    this.item_status = item_data.item_status;
    this.description = item_data.description;
}
//Prototype
equip_item.prototype.inventory_id = null;
equip_item.prototype.equip_id = null;
equip_item.prototype.item_status = null;
equip_item.prototype.description = null;

exports.addEquipStatus = function (status, cb) {
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
            sql = 'INSERT INTO equip_status VALUES(?,?)';
            inserts = [null, status];
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
};

exports.getEquipStatus = function(column, value, cb) {
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
            sql = 'SELECT * FROM item_status WHERE ?? = ?';
            inserts = [column, value];
            sql = mysql.format(sql, inserts);
            connection.query(sql, function (err, results) {
                sql_pool.release(connection);
                callback(err, results);
            });
        },
        function(results, callback) {
            if(results.length < 1){
                cb(null);
            } else {
                var items = new Array();
                results.forEach(function(e, i) {
                    var eqitem = new equip_status(results[i])
                    items.push(eqitem);
                });
                cb(items);
            }
    }], function (err) {
            throw new Error('Error connecting to database.');
        }
    )

};

exports.updateEquipStatus = function(id, column, value, cb){
    async.waterfall([
                   //Acquire SQL connection from pool
                    function(callback){
                        sql_pool.acquire(function(err, connection){
                            callback(err, connection);
                        });
                    },
                    //Update User Activation Status
                    function(connection, callback){
                        var sql = 'UPDATE equip_status SET  status_description = ? WHERE ?? = ?'
                        var inserts = [value, column, id];
                        sql = mysql.format(sql,inserts);
                        connection.query(sql, function(err, results) {
                              sql_pool.release(connection);
                              cb(results) 
                            });   
                     }
                ], function (err) {
                        throw new Error(err);
                      
                    })

};

exports.deleteEquipStatus = function(id, cb){
    async.waterfall([
                   //Acquire SQL connection from pool
                    function(callback){
                        sql_pool.acquire(function(err, connection){
                            callback(err, connection);
                        });
                    },
                    //Update User Activation Status
                    function(connection, callback){
                        var sql = 'DELETE FROM item_status WHERE status_id = ?'
                        var inserts = [id];
                        sql = mysql.format(sql,inserts);
                        connection.query(sql, function(err, results) {
                              sql_pool.release(connection);
                              cb(results) 
                            });   
                     }
                ], function (err) {
                        throw new Error(err);
                      
                    })

};

exports.listEquipStatuses = function(cb){
    async.waterfall([
        //Acquire SQL connection from pool
        function(callback){
            sql_pool.acquire(function(err, connection){
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function(connection, callback){
            var sql = 'SELECT * FROM item_status';
            connection.query(sql, function(err, results) {
                sql_pool.release(connection);
                callback(err, results);   
            });
        },
        //
        function(results, callback) {
            if(results.length < 1){
                cb(null);
            } else {
                var items = new Array();
                results.forEach(function(e) {
                    var eqitem = new equip_status(e)
                    items.push(eqitem);
                });
                cb(items);
            }
    }], function (err, results) {
            throw new Error('Error connecting to database.');
        }
    )

};

exports.addEquipType = function(type, cb){
    async.waterfall([
        //Acquire SQL connection from pool
        function(callback){
            sql_pool.acquire(function(err, connection){
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function(connection, callback){
            var sql = 'INSERT INTO equip_type VALUES(?,?)';
            var inserts = [null, type];
            sql = mysql.format(sql,inserts);
            connection.query(sql, function(err, results) {
                sql_pool.release(connection);
                callback(err, results);  
            });
        },
        function(results) {
            if(!results){
                cb(null);
            }else {
                cb(results);
            }
    }], function (err) {
            cb(null);
        }
    )

};

exports.getEquipType = function(id, cb){
    async.waterfall([
        //Acquire SQL connection from pool
        function(callback){
            sql_pool.acquire(function(err, connection){
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function(connection, callback){
            var sql = 'SELECT * FROM equip_type WHERE type_id = ?';
            var inserts = [id];
            sql = mysql.format(sql,inserts);
            connection.query(sql, function(err, results) {
                sql_pool.release(connection);
                callback(err, results);   
            });
        },
        //
        function(results, callback) {
            if (results.length < 1) {
                cb(null);
            } else {
                var item = new equip_type(results[0]);
                cb(item);
            }
    }], function (err) {
            throw new Error(err);
        }
    )

};

exports.updateEquipType = function(id, value, cb){
    async.waterfall([
                   //Acquire SQL connection from pool
                    function(callback){
                        sql_pool.acquire(function(err, connection){
                            callback(err, connection);
                        });
                    },
                    //Update User Activation Status
                    function(connection, callback){
                        var sql = 'UPDATE equip_type SET type_desc = ? WHERE type_id = ?'
                        var inserts = [value, id];
                        sql = mysql.format(sql, inserts);
                        connection.query(sql, function(err, results) {
                              sql_pool.release(connection);
                              cb(results) 
                            });   
                     }
                ], function (err) {
                        throw new Error(err);
                      
                    })

};

exports.deleteEquipType = function(id, cb){
    async.waterfall([
                   //Acquire SQL connection from pool
                    function(callback){
                        sql_pool.acquire(function(err, connection){
                            callback(err, connection);
                        });
                    },
                    //Update User Activation Status
                    function(connection, callback){
                        var sql = 'DELETE FROM equip_type WHERE type_id = ?'
                        var inserts = [id];
                        sql = mysql.format(sql,inserts);
                        connection.query(sql, function(err, results) {
                              sql_pool.release(connection);
                              cb(results) 
                            });   
                     }
                ], function (err) {
                        cb(null);
                      
                    })

};

exports.listEquipTypes = function(cb){
    async.waterfall([
        //Acquire SQL connection from pool
        function(callback){
            sql_pool.acquire(function(err, connection){
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function(connection, callback){
            var sql = 'SELECT * FROM equip_type';
            connection.query(sql, function(err, results) {
                sql_pool.release(connection);
                callback(err, results);   
            });
        },
        //
        function(results, callback) {
            if(results.length < 1){
                cb(null);
            } else {
                var items = new Array();
                results.forEach(function(e) {
                    var eqitem = new equip_type(e)
                    items.push(eqitem);
                });
                cb(items);
            }
    }], function (err, results) {
            throw new Error('Error connecting to database.');
        }
    )

};

exports.listEquipTypes2 = function (length, page, filter, cb) {
    async.waterfall([
        //Acquire SQL connection from pool
        function (callback) {
            sql_pool.acquire(function (err, connection) {
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function (connection, callback) {
            var sql = "SELECT type_id, type_desc FROM equip_type WHERE type_desc like '%" + filter + "%' ORDER BY type_desc LIMIT ?,?";
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

};

exports.addEquipment = function(eq, cb){
    async.waterfall([
        //Acquire SQL connection from pool
        function(callback){
            sql_pool.acquire(function(err, connection){
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function(connection, callback){
            var sql = 'INSERT INTO equipment VALUES(?,?,?,?,?,?)';
            var inserts = [null, eq.type_id, eq.make, eq.model, eq.description, eq.image];
            sql = mysql.format(sql,inserts);
            connection.query(sql, function(err, results){
                sql_pool.release(connection);
                callback(err, results);  
            });
            
        },
        function(results) {
            if(!results.insertId){
                cb(null);
            }else {
            cb(results);
            }
    }], function (err) {
            cb(null);
        }
    )

};

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
        function(results, callback) {
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

exports.updateEquipment = function(item, cb){
    async.waterfall([
                   //Acquire SQL connection from pool
                    function(callback){
                        sql_pool.acquire(function(err, connection){
                            callback(err, connection);
                        });
                    },
                    //Update User Activation Status
                    function(connection, callback){
                        if(!item.image || item.image.length == 0) {
                        var sql = 'UPDATE equipment SET type_id = ?, make = ?, model = ?, description = ? WHERE equip_id = ?'
                        var inserts = [item.type_id, item.make, item.model, item.description, item.equip_id];
                        } else {
                            var sql = 'UPDATE equipment SET type_id = ?, make = ?, model = ?, description = ?, image = ? WHERE equip_id = ?'
                            var inserts = [item.type_id, item.make, item.model, item.description, item.image, item.equip_id];
                            }
                        sql = mysql.format(sql,inserts);
                        connection.query(sql, function(err, results) {
                              sql_pool.release(connection);
                              cb(results) 
                            });   
                     }
                ], function (err, result) {
                        
                      
                    })

};

exports.deleteEquipment = function(id, cb){
    async.waterfall([
                   //Acquire SQL connection from pool
                    function(callback){
                        sql_pool.acquire(function(err, connection){
                            callback(err, connection);
                        });
                    },
                    //Update User Activation Status
                    function(connection, callback){
                        var sql = 'DELETE FROM equipment WHERE equip_id = ?'
                        var inserts = [id];
                        sql = mysql.format(sql,inserts);
                        connection.query(sql, function(err, results) {
                              sql_pool.release(connection);
                              cb(results) 
                            });   
                     }
                ], function (err, result) {
                        
                      
                    })

};

exports.listEquipment = function(length, page, filter, cb){
    async.waterfall([
        //Acquire SQL connection from pool
        function(callback){
            sql_pool.acquire(function(err, connection){
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function(connection, callback){
            var sql = "SELECT type_desc as type_id, make, model, a.description, a.equip_id, COUNT(inventory_id) as itemcount \
                        FROM equipment a \
                        INNER JOIN equip_type b ON a.type_id = b.type_id \
                        LEFT JOIN equip_item c  ON a.equip_id = c.equip_id \
                        WHERE type_desc like '%" + filter + "%' OR make like '%" + filter + "%' \
                        OR model like '%" + filter + "%' OR a.description like '%" + filter + "%'\
                        GROUP BY type_desc, make, model, a.description, a.equip_id \
                        ORDER BY type_desc, make, model, equip_id LIMIT ?,?";


            var inserts = [(length * page),length];
            sql = mysql.format(sql,inserts);
            connection.query(sql, function(err, results) {
                sql_pool.release(connection);
                callback(err, results);
            });
        },
        function(results, callback) {
            if(results.length < 1){
                cb(null);
            } else {
                var items = new Array();
                results.forEach(function(e) {
                    items.push(e);
                });
                cb(items);
            }
    }], function (err, results) {
            throw new Error(err);
        }
    )

};

exports.addEquipItem = function(inventory_id, equip_id, cb){
    async.waterfall([
        //Acquire SQL connection from pool
        function(callback){
            sql_pool.acquire(function(err, connection){
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function(connection, callback){
            var sql = 'INSERT INTO equip_item VALUES(?,?,?,?)';
            var inserts = [inventory_id, equip_id, 1, null];
            sql = mysql.format(sql,inserts);
            connection.query(sql, function(err, results) {
                sql_pool.release(connection);
                callback(err, results);
            });
        },
        function(results, callback) {
            if(results.length < 1){
                cb(null);
            }else {
            cb(results);
            }
    }], function (err, results) {
            console.log(JSON.stringify(err));
            cb(null);
        }
    )

};

exports.getEquipItem = function(id, cb){
    async.waterfall([
        //Acquire SQL connection from pool
        function(callback){
            sql_pool.acquire(function(err, connection){
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function(connection, callback){
            var sql = 'SELECT * FROM equip_item WHERE inventory_id = ?';
            var inserts = [id];
            sql = mysql.format(sql,inserts);
            connection.query(sql, function(err, results) {
                sql_pool.release(connection);
                callback(err, results);   
            });
        },
        //
        function(results, callback) {
            if(results.length < 1){
                cb(null);
            }else {
                var eqitem = new equip_item(results[0])
                cb(eqitem);
                }
    }], function (err, results) {
            throw new Error(err);
        }
    )

};

exports.updateEquipItem = function(item, cb){
    async.waterfall([
                   //Acquire SQL connection from pool
                    function(callback){
                        sql_pool.acquire(function(err, connection){
                            callback(err, connection);
                        });
                    },
                    //Update User Activation Status
                    function(connection, callback){
                        var sql = 'UPDATE equip_item SET inventory_id = ?, equip_id = ?, item_status = ?, description = ? WHERE inventory_id = ?'
                        var inserts = [item.inventory_id, item.equip_id, item.item_status, item.description, item.inventory_id];
                        sql = mysql.format(sql,inserts);
                        connection.query(sql, function(err, results) {
                              sql_pool.release(connection);
                              cb(results) 
                        });   
                     }
                ], function (err, result) {
                        throw new Error(err);
                    })

};

exports.deleteEquipItem = function(id, cb){
    async.waterfall([
                   //Acquire SQL connection from pool
                    function(callback){
                        sql_pool.acquire(function(err, connection){
                            callback(err, connection);
                        });
                    },
                    //Update User Activation Status
                    function(connection, callback){
                        var sql = 'DELETE FROM equip_item WHERE inventory_id = ?'
                        var inserts = [id];
                        sql = mysql.format(sql,inserts);
                        connection.query(sql, function(err, results) {
                              sql_pool.release(connection);
                              cb(results) 
                            });   
                     }
                ], function (err, result) {
                    if (err) { throw new Error(err) }
                    })
};

exports.listEquipItems = function(length, page, filter, cb){
    async.waterfall([
        //Acquire SQL connection from pool
        function(callback){
            sql_pool.acquire(function(err, connection){
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function(connection, callback){
            var sql = "SELECT b.make, b.model, a.inventory_id, c.status_desc \
                        FROM equip_item a INNER JOIN equipment b ON a.equip_id = b.equip_id \
                        INNER JOIN item_status c ON a.item_status = c.status_id \
                        WHERE (make like '%" + filter + "%'	OR model like '%" + filter + "%' \
                        OR inventory_id like '%" + filter + "%' OR status_desc like '%" + filter + "%')\
                        ORDER BY make, model, inventory_id, status_desc LIMIT ?,?";
            var inserts = [(length * page),length];
            sql = mysql.format(sql,inserts);
            connection.query(sql, function(err, results) {
                sql_pool.release(connection);
                callback(err, results);
            });
        },
        function(results, callback) {
            if(results.length < 1){
                cb(null);
            } else {
                var items = new Array();
                results.forEach(function(e) {
                    //var eqitem = new equipment(e)
                    items.push(e);
                });
                cb(items);
            }
    }], function (err, results) {
            throw new Error(err);
        }
    )

};

exports.listSelectItems = function(equip_id, length, page, filter, cb){
    async.waterfall([
        //Acquire SQL connection from pool
        function(callback){
            sql_pool.acquire(function(err, connection){
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function(connection, callback){
            var sql = "SELECT b.make, b.model, a.inventory_id, c.status_desc \
                        FROM equip_item a INNER JOIN equipment b ON a.equip_id = b.equip_id \
                        INNER JOIN item_status c ON a.item_status = c.status_id \
                        WHERE (make like '%" + filter + "%'	OR model like '%" + filter + "%' \
                        OR inventory_id like '%" + filter + "%' OR status_desc like '%" + filter + "%')\
                        AND a.equip_id ='" + equip_id + "' \
                        ORDER BY make, model, inventory_id, status_desc LIMIT ?,?";
            var inserts = [(length * page),length];
            sql = mysql.format(sql,inserts);
            connection.query(sql, function(err, results) {
                sql_pool.release(connection);
                callback(err, results);
            });
        },
        function(results, callback) {
            if(results.length < 1){
                cb(null);
            } else {
                var items = new Array();
                results.forEach(function(e) {
                    //var eqitem = new equipment(e)
                    items.push(e);
                });
                cb(items);
            }
    }], function (err, results) {
            throw new Error(err);
        }
    )

};

exports.getEquipItemsByType = function(type, cb){
    async.waterfall([
        //Acquire SQL connection from pool
        function(callback){
            sql_pool.acquire(function(err, connection){
                callback(err, connection);
            });
        },
        //Prepare and execute SQL
        function(connection, callback){
            var sql = 'SELECT * FROM equip_item ei INNER JOIN equipment e ON ei.equip_id = e.equip_id INNER JOIN equip_type et ON e.type_id = et.type_id';
            connection.query(sql, function(err, results) {
                sql_pool.release(connection);
                callback(err, results);   
            });
        },
        function(results, callback) {
            if(results.length < 1){
                cb(null);
            } else {
                var items = new Array();
                results.forEach(function(e) {
                    var eqitem = new equipment(e)
                    items.push(eqitem);
                });
                cb(items);
            }
    }], function (err, results) {
            throw new Error('Error connecting to database.');
        }
    )

};