const express = require("express");
const router = express.Router();
const database = require('../database');
const { json } = require("body-parser");
const { query } = require('express-validator')
const nodemailer = require('nodemailer');
// const bcrypt = require('bcrypt');
const randtoken = require('rand-token');
const { redirect } = require("express/lib/response");

router.get("/", (req, res, next) => {
    res.render("index", {"user_id": req.session.user_id});
});

router.get("/signin", (req, res, next) => {
    res.render("login");
});
router.get("/signup", (req, res, next) => {
    res.render("register");
});
router.get("/signout", (req, res, next) => {
    req.session.destroy(function(){
        console.log("Bye");
    });
    res.redirect("/");
});

router.post('/login', function (request, response, next) {

    var user_email_address = request.body.user_email_address;

    var user_password = request.body.user_password;

    if (user_email_address && user_password) {
        var query = `
        SELECT * FROM user_login 
        WHERE user_email = "${user_email_address}"
        `;

        database.query(query, function (error, data) {

            if (data.length > 0) {
                for (var count = 0; count < data.length; count++) {
                    if (data[count].user_password == user_password) {
                        console.log(request.session)
                        request.session.user_id = data[count].user_name;

                        response.redirect("/");
                    }
                    else {
                        // response.send('Incorrect Password');
                        response.render('login', { "error": true, "message": "Incorrect Password" });
                    }
                }
            }
            else {
                // response.send('Incorrect Email Address');
                response.render('login', { "error": true, "message": "Incorrect Email Address" });
            }

        });
    }
    else {
        // response.send('Please Enter Email Address and Password Details');
        response.render('login', { "error": true, "message": "Please Enter Email Address and Password Details" });
    }

});

router.get('/logout', function (request, response, next) {

    request.session.destroy();

    response.redirect("/");

});

// registering the user in the database
router.post('/register', (request, response) => {
    request.assert('username', 'Name is required').notEmpty()           //Validate name
    request.assert('password', 'Password is required').notEmpty()   //Validate password
    request.assert('email', 'A valid email is required').isEmail()  //Validate email

    var errors = request.validationErrors()
    if (!errors) {   //No errors were found.  Passed Validation!
        var user_name = request.body.username;
        var user_email_address = request.body.email;
        var user_password = request.body.password;
        var query = "INSERT INTO user_login (user_email, user_name, user_password, user_session_id) VALUES ('"+user_email_address+"','"+ user_name +"','"+user_password+"','null');";
        
        database.query(query, function (err, result) {
            if(err == null){
                
                response.redirect("/signin");
            } else {
                response.render('register', { "error": true, "message": err.sqlMessage });
            }
        })
    } else {
        var message = "";
        errors.forEach(error => {
            message += " " + error["msg"] + ",";
        });

        response.render('register', { "error": true, "message": message });
    }
});

// adding the task to the database
router.post('/addtodo', function (req, res) {
    Dashboard.create({
        task: req.body.task,
        date: req.body.date,
        description: req.body.description,
        time: req.body.time,
        categoryChoosed: req.body.categoryChoosed
    })
        .then(newTask => {
            console.log("Successfully Created Task!", newTask);
            res.redirect('back');
        })
        .catch(err => {
            console.log("Error Creating Task!!", err);
            // res.status(500).send("Error Creating Task!!");
            res.redirect('back');
        });
});

function sendEmail(email, token) {
    var email = email;
    var token = token;
 
    var mail = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'anonymj0001@gmail.com', // Your email id
            pass: 'vihbuwsbekmmbxou' // Your password
        }
    });
 
    var mailOptions = {
        from: 'anonymj0001@gmail.com',
        to: email,
        subject: 'Reset Password Link - nicesnippets.com',
        html: '<p><span class="str">You requested for reset password, kindly use this </span><a href="http://localhost:8080/reset-password?token=' + token + '"><span class="str">link</span></a><span class="str"> to reset your password</span></p>'
    };
 
    mail.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log(0)
        }
    });
}
// send reset password link in email //
router.post('/reset-password-email', function(req, res, next) {
 
    var email = req.body.email;
 
    //console.log(sendEmail(email, fullUrl));
 
    database.query('SELECT * FROM user_login WHERE user_email ="' + email + '"', function(err, result) {
        if (err) {
            res.render('forgot_password', { "error": true, "message": err.sqlMessage });
        }
         
        var type = ''
        var msg = ''
   
        console.log(result[0]);
     
        if (result[0] != undefined && result[0].user_email.length > 0) {
           var token = randtoken.generate(20);
           var sent = sendEmail(email, token);
 
            if (sent != '0') {
                database.query('UPDATE user_login SET user_token="'+token+'" WHERE user_email ="' + email + '"', function(err, result) {
                    if(err){
                        res.render('forgot_password', { "error": true, "message": err.sqlMessage });
                    }
                })
                type = 'success';
                msg = 'The reset password link has been sent to your email address';
                res.render('forgot_password', {"error": false, "message": msg})
            } else {
                type = 'error';
                msg = 'Something goes to wrong. Please try again';
                res.render('forgot_password', { "error": true, "message": msg });
            }
        } else {
            console.log('2');
            type = 'error';
            msg = 'The Email is not registered with us';
            res.render('forgot_password', { "error": true, "message": msg });
        }
    });
})

// home page //
router.get('/forgotpassword', function(req, res, next) {
    res.render('forgot_password');
});


// reset page //
router.get('/reset-password', function(req, res, next) {
    res.render('reset_password', {
        title: 'Reset Password Page',
        token: req.query.token
    });
});

// update password to database //
router.post('/update-password', function(req, res, next) {
    var token = req.body.token;
    var password = req.body.password;
    database.query('SELECT * FROM user_login WHERE user_token ="' + token + '"', function(err, result) {
        if (err) {
            res.render('reset_password', { "error": true, "message": err.sqlMessage });
        }
        var type
        var msg
        if (result.length > 0) {
            // var saltRounds = 10;

            // // var hash = bcrypt.hash(password, saltRounds);
            // bcrypt.genSalt(saltRounds, function(err, salt) {
            //     bcrypt.hash(password, salt, function(err, hash) {
            //         var data = {
            //             password: hash
            //         }
            //         connection.query('UPDATE users SET ? WHERE email ="' + result[0].email + '"', data, function(err, result) {
            //             if(err) throw err
            //         });
            //     });
            // });
            database.query('UPDATE user_login SET user_password="'+ password +'" WHERE user_email ="' + result[0].email + '"', function(err, result) {
                if(err) throw err
            });
            type = 'success';
            msg = 'Your password has been updated successfully';
            res.redirect("/signin");
        } else {
            console.log('2');
            type = 'success';
            msg = 'Invalid link; please try again';
            res.render('reset_password', { "error": true, "message": msg });
        }
    });
})

// complate the task to the database
router.get('/edit-task', function (req, res) {
    var user_email_address = request.body.user_email_address;

    var user_password = request.body.user_password;

    if (user_email_address && user_password) {
        query = `
        SELECT * FROM user_login 
        WHERE user_email = "${user_email_address}"
        `;

        database.query(query, function (error, data) {

            if (data.length > 0) {
                for (var count = 0; count < data.length; count++) {
                    if (data[count].user_password == user_password) {
                        request.session.user_id = data[count].user_id;

                        response.redirect("/");
                    }
                    else {
                        response.send('Incorrect Password');
                    }
                }
            }
            else {
                response.send('Incorrect Email Address');
            }
            response.end();
        });
    }
    else {
        response.send('Please Enter Email Address and Password Details');
        response.end();
    }

});


// deleting the task to the database
router.get('/delete-todo', function (req, res) {
    let id = req.query.id;
    var user_email_address = request.body.user_email_address;

    var user_password = request.body.user_password;

    if (user_email_address && user_password) {
        query = `
        SELECT * FROM user_login 
        WHERE user_email = "${user_email_address}"
        `;

        database.query(query, function (error, data) {

            if (data.length > 0) {
                for (var count = 0; count < data.length; count++) {
                    if (data[count].user_password == user_password) {
                        request.session.user_id = data[count].user_id;

                        response.redirect("/");
                    }
                    else {
                        response.send('Incorrect Password');
                    }
                }
            }
            else {
                response.send('Incorrect Email Address');
            }
            response.end();
        });
    }
    else {
        response.send('Please Enter Email Address and Password Details');
        response.end();
    }


});

module.exports = router;
