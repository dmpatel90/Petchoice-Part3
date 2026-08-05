// Optional real-email delivery for OTP codes.
//
// If SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS are set in .env, this
// will actually email the code. If they're missing — or nodemailer hasn't
// been installed yet (npm install), or the send fails for any reason —
// sendOtpEmail() just returns false and the caller falls back to showing
// the code on screen ("demo mode"). The app never crashes because of this.

let nodemailer;

try {
    nodemailer = require("nodemailer");
} catch (err) {
    nodemailer = null;
}

let transporter = null;
let attemptedSetup = false;

function getTransporter() {

    if (!nodemailer) {
        return null;
    }

    if (attemptedSetup) {
        return transporter;
    }

    attemptedSetup = true;

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        return null;
    }

    transporter = nodemailer.createTransport({

        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,

        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }

    });

    return transporter;

}

// Attempts to email the OTP. Resolves to true only if a real email was
// sent successfully — callers should always also show the code on
// screen so the flow keeps working even when email isn't configured.
async function sendOtpEmail(toEmail, code) {

    const t = getTransporter();

    if (!t || !toEmail) {
        return false;
    }

    try {

        await t.sendMail({

            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: toEmail,
            subject: "Pet Choice — Your password reset code",
            text: `Your Pet Choice verification code is ${code}. It expires in 10 minutes.`,
            html: `<p>Your Pet Choice verification code is:</p><h2>${code}</h2><p>This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>`

        });

        return true;

    } catch (err) {

        console.error("EMAIL OTP SEND FAILED:", err.message);
        return false;

    }

}

module.exports = { sendOtpEmail };
