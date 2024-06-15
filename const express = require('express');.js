const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
const port = 3000;
const nodemailer = require('nodemailer');
const connection = require('./database');
const { log } = require('console');
var userData;
const session = require('express-session');

// Use sessions
app.use(session({
    secret: 'session', // Change this to a random string
    resave: false,
    saveUninitialized: true
}));

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: '23ca10sh66@mitsgwl.ac.in',
        pass: 'Shivaay@123'
    }
});

app.set("views", path.join(__dirname, "/views"));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));





app.get('/', (req, res) => {
    res.render('index.ejs');
});


app.get('/about', function (req, res) {
    res.render('aboutUs.ejs');
});


app.get('/contact', (req, res) => {
    res.render('contactUs.ejs');
});

app.get('/FAQ', (req, res) => {
    res.render('FAQ.ejs');
});



// Registration 
app.post('/register', function (req, res) {

    // Register Data in SQL 
    const formData = req.body; // Get Body
    const user = formData.userCategory;
    p_id = formData.Username;
    p_name = formData.name;
    var sql;
    // CREATE TABLE `servicehub`.`user` (
    //     `u_id` VARCHAR(25) NOT NULL,
    //     `u_name` VARCHAR(50) NOT NULL,
    //     `u_Email` VARCHAR(100) NOT NULL,
    //     `u_address` VARCHAR(50) NOT NULL,
    //     `PhoneNo` BIGINT(10) NOT NULL,
    //     `u_password` VARCHAR(45) NOT NULL,
    //     `u_City` VARCHAR(40) NOT NULL,
    //     PRIMARY KEY (`u_id`)
    // );

    if ("user" == user.toLowerCase()) {
        sql = `INSERT INTO ${user.toLowerCase()} (u_id, u_name, u_Email, u_address, PhoneNo, u_password, u_City) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    }
    else {
        sql = `INSERT INTO ${user.toLowerCase()} (p_id, p_name, p_Email, p_address, contact_no, p_password, p_City) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    }

    // Send SQL And Extract the Details of Form 
    connection.query(sql, [formData.Username, formData.name, formData.Email, formData.Address, formData.PhoneNo, formData.Password, formData.City], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.send('Error inserting data:');
            return;
        } else {
            console.log('Data inserted successfully:', result);
            res.send('<script>alert("Registration Successfully");</script>');
            if ("user" == user.toLowerCase()) {
                console.log("Working");
            }
            else {
                res.render('provider.ejs',{p_id,p_name});
            }
        }
    });
});

app.post('/Login', (req, res) => {

    const login = req.body;
    var user = login.btnradio;
    p_id = login.Username;
    // Construct SQL query based on user type
    var query;
    if ("user" == user.toLowerCase()) {
        query = `SELECT * FROM ${user.toLowerCase()} WHERE u_id = ? AND u_password = ?`;
    }
    else {
        query = `SELECT * FROM ${user.toLowerCase()} WHERE p_id = ? AND p_password = ?`;
    }

    // Execute the SQL query
    connection.query(query, [login.Username, login.Password], (err, results) => {
        console.log(results + "Hi");
        if (err) {
            // Handle database errors
            console.error('Error in database query:', err);
            // Send error response
            res.status(500).send('<script>alert("Invalid Data Enter");</script>');
            return;
        }
        if (results.length > 0) {
            userData = results;
            console.log(userData);
            if ("user" == user.toLowerCase()) {
                console.log("Working");
            }
            else {
                const pName = userData[0].p_name.split(' ')[0];
                const p_id = 'some-p_id-retrieved-from-database';
                req.session.p_id = p_id;
                // providerDetails = userData[0].p_id;
                res.render('provider.ejs',{pName});
            }
        } else {
            // If authentication fails
            // Send error response
            res.status(401).send('Invalid email or password');
        }
    });
});



app.get('/Add-Services', (req, res) => {
    const data = req.body; 
    const p_id = req.session.p_id;
    console.log(p_id);
    console.log("Hi This is From Add Services");

    const query1 = "INSERT INTO servicehub.services (title, description, price, category, p_id) VALUES (?, ?, ?, ?, ?)";
    res.render('Provider/Addservices.ejs');
    if (req.method === 'POST' && req.body.submitButton === 'submit'){

        connection.query(query, [data.title, data.description, data.price, data.category, data.providerId], (err, results) => {
            if (err) {
                console.error('Error inserting service:', err);
                res.send('<script>alert("Internal Server Error");</script>');
                return;
            }
            else{
    
                console.log('Service inserted successfully:', result);
                res.send(`
                <div class="alert alert-success" role="alert">
                <h4 class="alert-heading">Well done!</h4>
                <p>Aww yeah, you successfully read this important alert message. This example text is going to run a bit longer so that you can see how spacing within an alert works with this kind of content.</p>
                <hr>
                <p class="mb-0">Whenever you need to, be sure to use margin utilities to keep things nice and tidy.</p>
              </div>`);
            }
        });
    }
});


// Email Template
const htmlResponse = `
    <html>
    <body>
        <p>Dear User,</p>
        <p>Thank you for contacting us!</p>
        <p>Your message has been successfully received. We will get back to you shortly.</p>
        <p>Best regards,<br>Services Hub</p>
    </body>
    </html>
`;

app.post('/sendEmail', (req, res) => {

    const { email, subject, description, file } = req.body;
    console.log(req.body);

    // Define email content
    const mailOptionsToAdmin = {
        from: email,
        to: 'Shivammaheshwari0401@gmail.com', // Change this to your admin email address
        subject: subject,
        text: `We Received a Query from this Email : ${email} and their Query is : ${description}`,
        file: file
    };
    const mailOptionsToSender = {
        from: '23ca10sh66@mitsgwl.ac.in', // Change this to your email address
        to: email,
        subject: 'Thank you for contacting us!',
        html: htmlResponse
    };

    // Send email to admin
    transporter.sendMail(mailOptionsToAdmin, function (error, info) {
        if (error) {
            console.error('Error sending email to admin:', error);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Email sent to admin:', info.response);
            // Send email to sender
            transporter.sendMail(mailOptionsToSender, function (error, info) {
                if (error) {
                    console.error('Error sending email to sender:', error);
                    // Handle error but do not send error response to avoid confusing the user
                } else {
                    console.log('Email sent to sender:', info.response);
                }
            });
            res.send('Email sent successfully!');
        }
    });
});



// For Listening
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
    connection.connect(function (err) {
        if (err) throw err;
        console.log('Database connected!');
    })
});
