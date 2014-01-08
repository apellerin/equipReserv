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
        invalid_credentials: {
            messageheader: 'Invalid Credentials:  ',
            message: 'Please login or register.',
            messagetype: 'error' 
        },
        incomplete_reg: {
            messageheader: 'Registration form missing data:  ',
            message: 'Please correct and resubmit.',
            messagetype: 'error' 
        },
        user_exists: {
            messageheader: 'Unable to create account:  ',
            message: 'A user with this email/username already exists.',
            messagetype: 'error'
        },
        generic_error: {
            messageheader: 'Error:  ',
            message: 'Please retry your request later.',
            messagetype: 'error'
        },
        post_activate: {
            messageheader: 'Thank you!  ',
            message: 'Please login to complete the activation of your account.',
            messagetype: 'success'
        },
        no_matching_account: {
            messageheader: 'Sorry,  ',
            message: 'we were unable to find an account matching the information submitted.',
            messagetype: 'error'
        },
        reset_link_expired: {
            messageheader: 'Link Expired:  ',
            message: 'If you still need to reset your password, please request a new link.',
            messagetype: 'warning'
        },
        reg_success: {
            messageheader: 'Thank you for registering!  ',
            message: 'An email has been sent with instructions on how to activate your account.',
            messagetype: 'success'
        },
        resend_activate: {
            messageheader: 'Mail Sent:  ',
            message: 'Please check your email for activation instructions.',
            messagetype: 'info'
        },
        notactivated: {
            //see feedback.jade for configuration
            messageheader: '',
            message: '',
            messagetype: ''
        },
        resetpassword: {
            //see feedback.jade for configuration
            messageheader: '',
            message: '',
            messagetype: ''
        }
    }
}
