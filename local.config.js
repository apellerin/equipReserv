//mySQL Database Connection Info
exports.config = 
{ 
   
db_config: {
    host : 'localhost',
    user : 'equipReserv',
    password : '@ppl!c@t!0n',
    database : 'equipreserv',
    max_poolsize: 10,
    min_poolsize: 2,
    idle_timeout_ms: 30000,
    log_pool: false

    },

smtp_config: {
    host: 'smtp.gmail.com',
    secureConnection: true,
    port: 465,
    auth: {username: 'anthonyleepellerin@gmail.com', password: 'S@m1121@ntha'}
    },

emails: {
    user_activation_email: {
        text: 'Thank you for registering!  Please follow the link to activate your account: ',
        link: 'http://192.168.1.105:3000/users/activate?id='
        }
    }
}
