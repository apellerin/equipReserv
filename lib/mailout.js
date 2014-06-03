var nodemailer = require('nodemailer');
var jade = require('jade');
var fs = require('fs');
//require local configuration file - smtp info
var local = require('../local.config.js');

//create transport object for nodemailer
var transport = nodemailer.createTransport('SMTP', {
    host: local.config.smtp_config.host,
    secureConnection: local.config.smtp_config.secureConnection,
    port: local.config.smtp_config.port,
    auth: {
        user: local.config.smtp_config.auth.username,
        pass: local.config.smtp_config.auth.password
        }
  });

//email function - takes text, to, subject - from is in the local config
module.exports.sendEmail = function(text, html, to, subject) {
    //create message object with parameters
    var msg = {
      transport: transport,
      text:    text,
      html: html,
      from:    local.config.smtp_config.auth.username,
      to: to,
      subject: subject};
    //user nodemailer to send message object
    nodemailer.sendMail(msg, function (err) {
    if (err) { console.log('Sending to ' + to + ' failed: ' + err); }
    console.log('Sent to ' + to);
    //close transport object
    msg.transport.close();
    });
}

exports.compileHTMLEmail = function(filepath, dataobj, cb) {

  var options = {

  }

  fs.readFile(filepath, 'utf8', function (err, data) {
    if (err) throw err;

    var fn = jade.compile(data, {filename: filepath});
    var html = fn(dataobj);
    cb(html);

  });
}