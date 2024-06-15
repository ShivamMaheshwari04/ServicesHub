const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
const port = 3000;
const nodemailer = require('nodemailer');
const connection = require('./database');
const session = require('express-session');
// or via CommonJS
var s_id;
var userData = {
    name: null,
    id: null,
    user_type: null,
    token: false,
    emali: null,
    address: null,
    number: null,
    error: false,
}
// Use sessions
app.use(session({
    secret: 'session', // Change this to a random string
    resave: true,
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

// Routes...
app.get('/', (req, res) => {
    res.render('index.ejs', { userData });
});


app.get('/about', function (req, res) {
    res.render('./Other Files/aboutUs.ejs', { userData });
});


app.get('/contact', (req, res) => {
    res.render('./Other Files/contactUs.ejs');
});

app.get('/FAQ', (req, res) => {
    res.render('./Other Files/FAQ.ejs', { userData });
});

let globalFeedback = []; // Declare globalFeedback variable

function getFeedback(callback) {
    const sql = "SELECT f.f_id,f.comment,f.rating,b.s_id,b.b_date,u.u_name FROM  servicehub.feedback AS f INNER JOIN servicehub.booking AS b ON b.b_id = f.b_id INNER JOIN servicehub.user AS u ON u.u_id = b.u_id;";
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error Fetching Feedback:', err);
            callback(err, null);
            return;
        }

        if (result.length > 0) {
            globalFeedback = result; // Assign result to globalFeedback variable
            callback(null, result);
        } else {
            globalFeedback = []; // If no feedback found, assign an empty array to globalFeedback
            callback(null, []);
        }
    });
}


// Define the route for /services
app.get('/services', (req, res) => {
    const query = "SELECT * FROM servicehub.services";
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error in database query:', err);
            return res.status(500).send('<script>alert("Invalid Data Enter");</script>');
        }
        if (results.length > 0) {
            const items = results;
            getFeedback((err, feedback) => {
                if (err) {
                    console.error('Error Fetching Feedback:', err);
                    return;
                }

                // Do something with the feedback array, or use globalFeedback directly
                console.log(globalFeedback);
            });
            // console.log(items)
            res.render('./services.ejs', { items, userData });
            app.get('/modal', (req, res) => {
                const index = req.query.index;
                // Use the index to retrieve the corresponding data
                const item = items[index];
                // console.log(item)
                res.render('modal.ejs', { item, userData, feedback: globalFeedback });
            });


        } else {
            res.status(401).send('No services found');
            res.redirect('/services')
        }
    });
});

let id;
app.get('/book', (req, res) => {
    id = req.query.id;
    const query = "SELECT * FROM services WHERE s_id = ?";

    // if (userData.token === false) {
    //     // User is not logged in, show an alert
    //     return res.render('./Alerts/Alert.ejs');
    // }
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error in database query:', err);
            return res.status(500).send('<script>alert("Invalid Data Enter");</script>');
        }

        if (results.length === 0) {
            // Service not found in the database
            return res.status(404).send('<script>alert("Service not found");</script>');
        }
        res.render('./Booking/Book.ejs', { service: results[0], userData });
    });

    const p_id = userData.id; // Retrieve p_id from the session

});

app.post('/Booking', (req, res) => {
    // Generate the b_id dynamically
    const query1 = "SELECT b_id FROM servicehub.booking ORDER BY b_id DESC LIMIT 1";
    connection.query(query1, (err, results) => {
        if (err) {
            console.error('Error querying last b_id:', err);
            return res.status(500).send('<script>alert("Internal Server Error");</script>');
        }

        let b_id;
        if (results.length > 0) {
            const lastBID = results[0].b_id;
            const numericPart = parseInt(lastBID.substring(1), 10); // Extract the numeric part and parse it
            const nextNumericPart = numericPart + 1; // Increment the numeric part by 1
            b_id = "B" + nextNumericPart.toString().padStart(2, "0"); // Combine with the prefix "B" and pad the numeric part with leading zeros if necessary
        } else {
            b_id = "B00"; // If no b_id found, start with "B00" as the default
        }

        // Handle form submission
        const formData = req.body;
        const status = "confirm"
        const insertQuery = "INSERT INTO servicehub.booking (b_id, b_date, timeslot, u_id, s_id,status) VALUES (?, ?, ?, ?, ?,?)";
        connection.query(insertQuery, [b_id, formData.date, formData.timeslot, userData.id, id, status], (insertErr, insertResults) => {
            if (insertErr) {
                console.error('Error inserting booking:', insertErr);
                return res.status(500).send('<script>alert("Internal Server Error");</script>');
            } else {
                console.log('Booking inserted successfully:', insertResults);
                return res.render('./Alerts/Booking.ejs');
            }
        });
    });
});





// Registration 
app.post('/register', (req, res) => {
    const formData = req.body;
    const user = formData.userCategory;
    const p_id = formData.Username; // Assuming p_id is retrieved from the form
    const p_name = formData.name; // Assuming p_name is retrieved from the form

    let sql;

    if (user.toLowerCase() === "user") {
        sql = `INSERT INTO ${user.toLowerCase()} (u_id, u_name, u_Email, u_address, PhoneNo, u_password, u_City) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    } else {
        sql = `INSERT INTO ${user.toLowerCase()} (p_id, p_name, p_Email, p_address, contact_no, p_password, p_City) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    }

    connection.query(sql, [formData.Username, formData.name, formData.Email, formData.Address, formData.PhoneNo, formData.Password, formData.City], (err, result) => {
        if (err) {
            res.render('./Alerts/RegisterErr.ejs');
            return;
        } else {
            userData = {
                name: formData.name,
                id: formData.Username,
                user_type: user,
                token: true,
                email: formData.Email,
                address: formData.address,
                number: formData.PhoneNo,
            };
            console.log('Data inserted successfully:', result);
            // res.send('<script>alert("Registration Successfully");</script>');
            res.render('index.ejs', { userData });

        }
    });
});





// Login
app.post('/Login', (req, res) => {
    const login = req.body;
    const user = login.btnradio;
    const p_id = login.Username; // Assuming p_id is retrieved from the form

    let query;
    if (user.toLowerCase() === "admin") {
        if (login.Username == "admin@123" && login.Password == "admin") {
            userData = {
                name: "admin",
                id: "admin@123",
                user_type: "admin",
                token: true,
                email: "NA",
                address: "NA",
                number: "NA",
            }
            res.render('index.ejs', { userData });
        }
        else {
            userData = {
                error: true,
            }
            // res.render('./Alerts/Warning.ejs');
            // return;
            res.render('index.ejs', { userData })
            userData.error = false;
        }
    }
    else if (user.toLowerCase() === "user") {
        query = `SELECT * FROM ${user.toLowerCase()} WHERE u_id = ? AND u_password = ?`;
        createConnection();
    }
    else {
        query = `SELECT * FROM ${user.toLowerCase()} WHERE p_id = ? AND p_password = ?`;
        createConnection();
    }

    function createConnection() {
        connection.query(query, [login.Username, login.Password], (err, results) => {
            if (err) {
                console.error('Error in database query:', err);
                res.status(500).send('<script>alert("Invalid Data Enter");</script>');
                return;
            }

            if (results.length > 0) {
                const pName = results[0].p_name || results[0].u_name;
                userData = {
                    name: pName,
                    id: p_id,
                    user_type: user,
                    token: true,
                    email: results[0].p_Email || results[0].u_Email,
                    address: results[0].u_address || results[0].p_address,
                    number: results[0].PhoneNo || results[0].contact_no,
                };
                // console.log(results)
                // console.log(userData)
                // Render index.ejs and pass userData to it
                res.render('index.ejs', { userData });
            } else {
                res.render('./Alerts/Warning.ejs');
            }
        });
    }

});

// Assuming you have initialized and configured your Express app and session middleware

// Logout Route
app.get('/logout', (req, res) => {
    // Clear session data
    userData = {
        name: null,
        id: null,
        user_type: null,
        token: false,
    }
    res.redirect('/');
    // Push a new entry onto the history stack, effectively preventing the user from going back

});


app.post('/submit-feedback', (req, res) => {
    // Extract data from request body
    const { userId, rating, comment, f_status, b_id } = req.body;

    const query1 = "SELECT f_id FROM servicehub.feedback ORDER BY f_id DESC LIMIT 1";
    connection.query(query1, (err, results) => {
        if (err) {
            console.error('Error querying last f_id:', err);
            return res.status(500).send('<script>alert("Internal Server Error");</script>');
        }

        let f_id;
        if (results.length > 0 && results[0].f_id) {
            const lastFID = results[0].f_id;
            const numericPart = parseInt(lastFID.substring(1), 10); // Extract the numeric part and parse it
            const nextNumericPart = numericPart + 1; // Increment the numeric part by 1
            f_id = "F" + nextNumericPart.toString().padStart(2, "0"); // Combine with the prefix "F" and pad the numeric part with leading zeros if necessary
        } else {
            f_id = "F00"; // If no f_id found, start with "F00" as the default
        }

        const sql = "INSERT INTO servicehub.feedback (f_id, comment, rating, b_id, f_status) VALUES (?, ?, ?, ?, ?)";

        // Here you can process and store the feedback data in your database
        // For example:
        console.log('User ID:', userId);
        console.log('Rating:', rating);
        console.log('Comment:', comment);
        console.log('Feedback Status:', f_status);
        console.log('Booking ID:', b_id);

        connection.query(sql, [f_id, comment, rating, b_id, f_status], (err, result) => {
            if (err) {
                console.error('Error storing feedback:', err);
                res.status(500).send('Error storing feedback');
            } else {
                console.log('Feedback stored successfully');
                res.status(200).send('Feedback received successfully');
            }
        });
    });

    // Send a response to acknowledge receipt of the data
    // res.sendStatus(200); // Success status code
});

let items = []; // Declare items outside the route handler function
let listing;
let feedback = [];
app.get('/profile', (req, res) => {
    let length;
    var query, sql, sql2;
    if ("provider" == userData.user_type.toLowerCase() || "user" == userData.user_type.toLowerCase()) {
        query = `SELECT b.b_id,p.p_id,b.b_date,b.timeslot,b.s_id,s.description,s.s_status,b.status,p.p_name,p.contact_no,s.title,s.price,s.ImageLink,u.u_id,u.u_name,u.u_address,u.PhoneNo FROM  servicehub.booking AS b INNER JOIN servicehub.services AS s ON b.s_id = s.s_id  INNER JOIN servicehub.provider AS p ON s.p_id = p.p_id INNER JOIN servicehub.user AS u ON b.u_id = u.u_id WHERE b.u_id = ? or s.p_id = ?;`;
        query2 = "select * from servicehub.feedback";
        sql = "select * from servicehub.services where p_id = ?";
    } else {
        query = `SELECT b.b_id,p.p_id,b.b_date,b.timeslot,b.s_id,s.description,s.s_status,b.status,p.p_name,p.contact_no,s.title,s.price,s.ImageLink,u.u_id,u.u_name,u.u_address,u.PhoneNo FROM  servicehub.booking AS b INNER JOIN servicehub.services AS s ON b.s_id = s.s_id  INNER JOIN servicehub.provider AS p ON s.p_id = p.p_id INNER JOIN servicehub.user AS u ON b.u_id = u.u_id`;
        sql = "select * from servicehub.services";
        query2 = "select * from servicehub.feedback";
    }


    connection.query(sql, [userData.id], (err, result) => {
        if (err) {
            console.error('Error Fetching Services Listing:', err);
            res.status(500).send('Error updating booking status');
            return;
        }

        if (result.length > 0) {
            listing = result; // Assign results to the globally declared items variable
            length = listing.length;
        }

        // console.log("this is :" + length);

    });

    //Feedback 
    connection.query(query2, (err, result) => {
        if (err) {
            console.error('Error Fetching Services Listing:', err);
            res.status(500).send('Error updating booking status');
            return;
        }
    
        // Check if result contains data
        if (result && result.length > 0) {
            feedback = result; // Store the result in the feedback array
        }
    });
    // Booking Data Sender
    connection.query(query, [userData.id, userData.id], (err, results) => {
        if (err) {
            console.error('Error in database query:', err);
            res.status(500).send('<script>alert("Invalid Data Enter");</script>');
            return;
        }

        if (results.length > 0) {
            items = results; // Assign results to the globally declared items variable
        } else {
            // res.render('./Alerts/Warning.ejs');
        }

        try {
            if ("provider" == userData.user_type.toLowerCase()) {
                // console.log(items);
                res.render('Provider/provider.ejs', { provider: userData, items: items, listing, length, feedback : feedback});
            } else if ("user" == userData.user_type.toLowerCase()) {
                res.render('Provider/userpanel.ejs', { items: items, user: userData, length: length, feedback: feedback });
            } else {
                res.render('Provider/admin.ejs', { user: userData, items: items, listing, length,feedback: feedback });
            }
        } catch (error) {
            console.error("Error rendering profile page:", error);
            res.render('./Alerts/LoginError.ejs');
        }
    });

});

// Route to handle GET request for editing
var item = {};
app.get('/Edit', (req, res) => {
    const index = req.query.index;
    // Use the index to retrieve the corresponding data
    item = listing[index];
    console.log(item)
    res.render('Provider/Edit.ejs', { item, userData });
});

// Route to handle POST request for updating service data
app.post('/update-service', (req, res) => {
    // Retrieve updated data from the request body
    const updatedData = req.body;
    const oldData = item;
    const s_id = item.s_id;
    let sqlQuery = 'UPDATE servicehub.services SET'
    let updatedData1 = {};



    // Data Checking
    for (const key in updatedData) {
        if (oldData.hasOwnProperty(key) && oldData[key] !== updatedData[key]) {
            updatedData1[key] = updatedData[key];
        }
    }

    // // Query Building
    for (const key in updatedData1) {
        if (updatedData1.hasOwnProperty(key)) {
            // If the value is a string, add quotes around it in the SQL query
            const value = typeof updatedData1[key] === 'string' ? `'${updatedData1[key]}'` : updatedData1[key];
            sqlQuery += ` ${key} = ${value},`;
        }
    }
    // Removing the trailing comma from the last SET statement
    sqlQuery = sqlQuery.slice(0, -1);
    sqlQuery += ` WHERE s_id = "${s_id}";`
    connection.query(sqlQuery, (err, result) => {
        if (err) {
            console.error('Error updating service:', err);
            res.status(500).json({ message: 'Error updating service' });
            return;
        }
        // Send a success response if the update was successful
        res.status(200).json({ message: 'Service updated successfully' });
    });
});

app.post('/Delete-listing', (req, res) => {
    const listingId = req.body.id;
    const query = 'UPDATE servicehub.services SET s_status = "Inactive" WHERE s_id = ?';
    connection.query(query, [listingId], (err, result) => {
        if (err) {
            console.error('Error deleting listing:', err);
            res.status(500).json({ success: false, message: 'Error deleting listing' });
            return;
        }
        console.log('Deleted Successfully');
        res.json({ success: true, message: 'Listing deleted successfully' });
    });
});


app.post('/cancelBooking', (req, res) => {
    const { b_id } = req.body;

    // Update the status in the booking table
    const query = 'UPDATE servicehub.booking SET status = "cancelled" WHERE b_id = ?';
    connection.query(query, [b_id], (err, result) => {
        if (err) {
            console.error('Error cancelling booking:', err);
            res.status(500).send('Error cancelling booking');
            return;
        }
        console.log('Booking cancelled successfully');
        res.send('Booking cancelled');
    });
});

app.post('/updateBookingStatus', (req, res) => {
    const { b_id } = req.body;

    // Update the status in the booking table
    const query = 'UPDATE booking SET status = "completed" WHERE b_id = ?';
    connection.query(query, [b_id], (err, result) => {
        if (err) {
            console.error('Error updating booking status:', err);
            res.status(500).send('Error updating booking status');
            return;
        }
        console.log('Booking status updated successfully');
        res.send('Booking status updated');
    });
});


app.get('/profile/booking', (req, res) => {
    res.render('Provider/userpanel/viewBooking.ejs');
});
// Add Services
app.get('/Add-Services', (req, res) => {
    const p_id = userData.id; // Retrieve p_id from the session
    // console.log(p_id); // Check if p_id is available
    const query = "SELECT s_id FROM servicehub.services ORDER BY s_id DESC LIMIT 1"; // Assuming 'your_table' is the name of your table
    connection.query(query, (err, results) => {
        if (err) {
            console.log(err);
            return;
        }
        if (results.length > 0) {
            const lastASIN = results[0].s_id;
            const numericPart = parseInt(lastASIN.substring(1), 10); // Extract the numeric part and parse it
            const nextNumericPart = numericPart + 1; // Increment the numeric part by 1
            s_id = "A" + nextNumericPart.toString().padStart(2, "0"); // Combine with the prefix "A" and pad the numeric part with leading zeros if necessary
            // console.log(s_id);
        } else {
            s_id = "A00"; // If no ASIN found, start with "A00" as the default
        }
    });

    if (!p_id) {
        res.status(401).send('Unauthorized'); // Redirect or handle unauthorized access
        return;
    }

    // Render the Add Services page with p_id available
    res.render('Provider/AddService.ejs', { p_id, s_id });
});



// Handle form submission
app.post('/Add-Services', (req, res) => {
    const p_id = userData.id; // Retrieve p_id from the session
    const data = req.body;
    // Check if p_id is available
    if (!p_id) {
        res.status(401).send('<script>alert("Unauthorized Access!! Referesh Again");</script>'); // Redirect or handle unauthorized access
        return;
    }
    // Handle form submission
    const query = "INSERT INTO servicehub.services (s_id,ImageLink,title, description, price, category, p_id,s_status) VALUES (?, ?, ?, ?, ?, ?, ?,?)";
    let status = "Active"
    connection.query(query, [s_id, data.image, data.title, data.description, data.price, data.category, p_id, status], (err, results) => {
        if (err) {
            console.error('Error inserting service:', err);
            res.send('<script>alert("Internal Server Error");</script>');
            return;
        } else {
            console.log('Service inserted successfully:', results);
            // res.send('<script>alert("Listing Created Successfully");</script>');
            res.render('./Alerts/ListingCreated.ejs');
            return;
        }
    });
});

// Other routes...
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
            // res.send('Email sent successfully!');
            res.render('./Alerts/Success.ejs');
        }
    });
});

// For Listening
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
    connection.connect(function (err) {
        if (err) throw err;
        console.log('Database connected!');
    });
});
