//equipreserv Configuration File
var domain = 'http://192.168.1.105:3000';

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
        auth: {username: 'anthonyleepellerin@gmail.com', password: 'Sw3@tP3@'}
        },

    emails: {
        user_activation_email: {
            text: 'Thank you for registering!  Please follow the link to activate your account: ',
            link: domain + '/users/activate?id=',
            subject: 'Account Activation'        
        },
        reset_password_email: {
            text: 'Please follow the link to reset your password ',
            link: domain + '/users/resetpassword/?id=',
            subject: 'Password Reset Request'
        }
    },
    messages: {
        invalid_credentials: 'Invalid credentials.  Please login or register.',
        incomplete_reg: 'Registration form missing data.  Please correct and resubmit.',
        user_exists: 'A user with this email/username already exists.',
        generic_error: 'An error occurred.  Please retry your request later.',
        post_activate: 'Please login to complete the activation of your account.',
        no_matching_account: 'Sorry, we were unable to find an account matching that information. Please retry.',
        reset_link_expired: 'This link has expired.  If you still need to reset your password, please request a new link.',
        reg_success: 'Thank you for registering!  An email has been sent with instructions on how to activate your account',
        resend_activate: 'Please check your email for activation instructions.'
    }
}
