//equipreserv Configuration File
var host = 'http://localhost:3000';

exports.config = 
{ 
    hostconfig: {
        rootpath: host,
        csspath: 'http://localhost:3000/stylesheets/',
        company_name: 'NHS',
        app_title: 'NHS EquipReserv'
    },
   
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

    session_config: {
        db: 'eqSessions',
        host: 'localhost',
        port: 27017,
        secret: 'S3KR#T'
    },

    smtp_config: {
        host: 'smtp.gmail.com',
        secureConnection: true,
        port: 465,
        auth: {username: 'equipreserv@gmail.com', password: 'reservation'}
        },

    admin_contact: {
        name: 'Administrator', 
        email: 'equipreserv@gmail.com', 
        phone: '', 
    },

    emails: {
        user_activation_email: {
            text: 'Thank you for registering!  Please follow the link to activate your account: ',
            link: host + '/users/activate?id=',
            subject: 'Account Activation'        
        },
        reset_password_email: {
            text: 'Please follow the link to reset your password: ',
            link: host + '/users/resetpassword/?id=',
            subject: 'Password Reset Request'
        },
        reservation_confirmation_email: {
            text: 'Thank you.  Your reservation has been received: ',
            link: host + '/login',
            subject: 'Reservation Request Received'
        },
        reservation_statuschange_email: {
            text: 'Your reservation status has been changed: ',
            link: host + '/login',
            subject: 'Status Change Notification'
        },
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
            message: 'No changes were applied.',
            messagetype: 'error'
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
        },
        filetoobig: {
            messageheader: 'Oops!: ',
            message: 'File is too large.  Please upload a file no larger than 3MB.',
            messagetype: 'error'
        },
        messagesubmitted: {
            messageheader: 'Thanks!: ',
            message: 'Your message has been sent.',
            messagetype: 'success'
        },
        messageerror: {
            messageheader: 'Oops!: ',
            message: 'An error occurred sending your message.  Please try again later.',
            messagetype: 'error'
        }
    }
}
