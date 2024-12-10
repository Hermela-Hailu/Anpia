// Importing necessary modules
const express = require('express'); // Framework to build the server
const bodyParser = require('body-parser'); // Middleware to parse incoming request bodies
const nodemailer = require('nodemailer'); // Module to send emails
const dotenv = require('dotenv'); // For managing sensitive credentials securely

// Load environment variables from a .env file
dotenv.config();

const app = express(); // Initialize the Express app
const PORT = process.env.PORT || 3000; // Use environment variable or default port 3000

// Middleware to handle JSON and URL-encoded data from the client
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Temporary in-memory storage for user data
let users = []; // This stores user data; for production, use a proper database (e.g., MongoDB or MySQL).

// Email transporter setup using Nodemailer
// This defines how emails are sent from your email account
const transporter = nodemailer.createTransport({
    service: 'gmail', // Email service provider (use 'gmail' in this case)
    auth: {
        user: process.env.ADMIN_EMAIL, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password (use app-specific password if 2FA is enabled)
    },
});

// Define the admin email (for notifications)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Route: Handles user sign-ups
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body; // Extract user details from request

    // Validate input: Ensure all required fields are present
    if (!name || !email || !password) {
        return res.status(400).send('All fields are required!');
    }

    // Save the user to the server (in memory)
    const user = { id: users.length + 1, name, email, password }; // Create a new user object
    users.push(user); // Add the user to the in-memory array

    // Notify admin of the new user via email
    const mailOptions = {
        from: process.env.ADMIN_EMAIL, // Sender email (your email)
        to: ADMIN_EMAIL, // Admin email (your email)
        subject: 'New User Sign-Up Notification', // Email subject
        text: `A new user has signed up:\n\nName: ${name}\nEmail: ${email}`, // Email content
    };

    try {
        await transporter.sendMail(mailOptions); // Send the email
        res.status(200).send('You have successfully signed up!'); // Notify the user of success
    } catch (error) {
        console.error('Error sending email:', error); // Log any email errors
        res.status(500).send('Sign-up successful, but failed to notify admin.'); // Notify user of partial success
    }
});

// Route: Allows admin to view all registered users
app.get('/admin/users', (req, res) => {
    // For simplicity, no authentication is added here. Add authentication for production.
    res.json(users); // Send the list of users as JSON
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


app.get('/test-email', async (req, res) => {
    const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: 'Test Email',
        text: 'This is a test email from your Node.js app!',
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send('Test email sent successfully!');
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).send('Failed to send test email.');
    }
});
