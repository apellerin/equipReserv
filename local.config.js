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
        auth: {username: 'equipreserv@gmail.com', password: 'reservation'}
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
        username_exists: {
            messageheader: 'Ooops!:  ',
            message: 'A user with this username already exists.',
            messagetype: 'error'
        },
        email_exists: {
            messageheader: 'Ooops!:  ',
            message: 'A user with this email already exists.',
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
        },
        invaliduserupdate: {
            messageheader: 'Invalid:  ',
            message: 'Update form missing data, please update and retry.',
            messagetype: 'error'
        },
        invalidpassword: {
            messageheader: 'Invalid Credentials: ',
            message: 'The password provided is invalid.',
            messagetype: 'error'
        },
        noupdate: {
            messageheader: 'Invalid Update: ',
            message: 'No changes were supplied.',
            messagetype: 'info'
        },
        accountupdated: {
            messageheader: 'Success: ',
            message: 'Your account has been updated.',
            messagetype: 'success'
        },
        notadmin: {
            messageheader: 'Access Denied:  ',
            message: 'You must be an administrator to access this area.  Please contact your system administrator.',
            messagetype: 'error'
        },
        //Equipment Type Messages
        itemadded: {
            messageheader: 'Success: ',
            message: 'Item was added succesfully.',
            messagetype: 'success'
        },
        itemexists: {
            messageheader: 'Oops!: ',
            message: 'This item already exists.',
            messagetype: 'error'
        }
    }
}
