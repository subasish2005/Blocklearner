const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        console.log('Attempting to create transporter with config:', {
            user: process.env.SMTP_USER,
            // Masking password for security
            pass: '****'
        });

        // Create transporter with updated security options
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465, // Using secure port 465 instead of 587
            secure: true, // Using SSL
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            debug: true, // Enable debug logging
            logger: true // Enable logger
        });

        console.log('Testing transporter connection...');
        await transporter.verify();
        console.log('Transporter connection successful');

        // Define email options
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html || options.message.replace(/\n/g, '<br>')
        };

        console.log('Sending email with options:', {
            to: mailOptions.to,
            subject: mailOptions.subject,
            from: mailOptions.from
        });

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', {
            messageId: info.messageId,
            response: info.response
        });
        
        return info;
    } catch (error) {
        console.error('Detailed email error:', {
            name: error.name,
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            stack: error.stack
        });
        throw error;
    }
};

// Export as both named and default export
module.exports = sendEmail;
module.exports.sendEmail = sendEmail;
