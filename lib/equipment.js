//Load required libraries
var async = require('async');
var mysql = require('mysql');
var mail = require('./mailout.js');
var local = require('../local.config.js');
    mail_props = local.config.emails;
    messages = local.config.messages;


// Object Definitions

//Equipment Types
function equip_type(type_data){
    this.type_id = type_data["type_id"],
    this.type_desc = type_data["description"]
}
//Prototype
equip_type.prototype.type_id = null;
equip_type.prototype.type_data = null;


//Equipment Statuses
function equip_status(status_data){
    this.status_id = status_data["status_id"],
    this.status = status_data["status"]
}
//Prototype
equip_status.prototype.status_id = null;
equip_status.prototype.status = null;

//Equipment
function equipment(equip_data){
    this.equip_id = equip_data["equip_id"],
    this.type_id = equip_data["type_id"],
    this.make = equip_data["make"],
    this.model = equip_data["model"],
    this.description = equip_data["description"]
}
//Prototype
equip_data.prototype.equip_id = null;
equip_data.prototype.type_id = null;
equip_data.prototype.make = null;
equip_data.prototype.model = null; 
equip_data.prototype.description = null;

//Equipment Item
function equip_item(item_data){
    this.inventory_id = item_data["inventory_id"],
    this.equip_id = item_data["equip_id"],
    this.make = item_data["item_status"],
    this.description = item_data["description"]
}
//Prototype
equipment_item.prototype.inventory_id = null;
equipment_item.prototype.equip_id = null; 
equipment_item.prototype.item_status = null; 
equipment_item.prototype.description = null; 


exports.addEquipStatus = function(req, res){


};

exports.getEquipStatus = function(req,res){


};

exports.updateEquipStatus = function(req,res){


};

exports.deleteEquipStatus = function(req,res){


};

exports.listEquipStatuses = function(req,res){


};


exports.addEquipType = function(req, res){


};

exports.getEquipType = function(req,res){


};

exports.updateEquipType = function(req,res){


};

exports.deleteEquipType = function(req,res){


};

exports.listEquipTypes = function(req,res){


};

exports.addEquipment = function(req, res){


};

exports.getEquipment = function(req,res){


};

exports.updateEquipment = function(req,res){


};

exports.deleteEquipment = function(req,res){


};

exports.listEquipment = function(req,res){


};

exports.addEquipItem = function(req, res){


};

exports.getEquipItem = function(req,res){


};

exports.updateEquipItem = function(req,res){


};

exports.deleteEquipItem = function(req,res){


};

exports.listEquipItems = function(req,res){


};