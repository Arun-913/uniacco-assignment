import 'dotenv/config';
import nodemailer from 'nodemailer';

function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
}

export const sendOTP = ({email}: {email: string}) =>{
    const otp = generateOTP();
    console.log("OTP: ", otp);
    return otp;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: true
        }
    });
    
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Registration OTP!',
        text: `Hi User,\n\nPlease use this OTP for resgistration!\n\nYour OTP is: ${otp}\nThanks`
    };
    
    transporter.sendMail(mailOptions, (error, info) =>{
        if(error){
            console.log('Error occureed', error);
        }
        else{
            console.log('Email sent : ', info.response);
        }
    });
    return otp;
};