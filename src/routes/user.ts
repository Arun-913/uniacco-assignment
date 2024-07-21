import { Router, Request, Response } from "express";
import { sendOTP } from "../services/sendOPT";
import { prismaClient } from "../db";
import * as crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dayjs from "dayjs";

function hashOTP(otp: number) {
    const hash = crypto.createHash('sha256');
    hash.update(otp.toString());
    return hash.digest('hex');
}

export const userRouter = Router();

userRouter.post('/register', async(req: Request, res: Response)=>{
    const {email} = req.body;
    try {
        const isUserExist = await prismaClient.user.findFirst({
            where: {
                email
            }
        })

        if(isUserExist){
            return res.json({
                message: "User already register"
            })
        }

        const otp = sendOTP({email});
        const user = await prismaClient.unverifedUser.findFirst({
            where: {
                email
            }
        });

        const hashedOtp = hashOTP(otp);

        if(!user){
            await prismaClient.unverifedUser.create({
                data: {
                    otp:  hashedOtp,
                    email
                }
            })
        }
        else{
            await prismaClient.unverifedUser.update({
                where: {
                    email
                },
                data: {
                    otp: hashedOtp,
                    createdAt: new Date()
                }
            })
        }

        res.json({
            message: "Registration successful. Please verify your email."
        })
    } catch (error) {
        console.log(error);
        res.json(error);
    }
})

userRouter.post('/request-otp', async(req, res)=>{
    const {email} = req.body;
    try {
        const otp = sendOTP({email});

        const user = await prismaClient.unverifedUser.findFirst({
            where: {
                email
            }
        });

        const hashedOtp = hashOTP(otp);

        await prismaClient.unverifedUser.update({
            where: {
                email
            },
            data: {
                otp: hashedOtp
            }
        })

        res.json({
            message: "OTP sent to your email."
        })
    } catch (error) {
        console.log(error);
        res.json(error);
    }
})

userRouter.post('/verify-otp', async(req: Request, res: Response)=>{
    const {email, otp} = req.body;
    try {
        const user = await prismaClient.unverifedUser.findFirst({
            where: {
                email
            }
        });
        
        if(user != null){
            const now = dayjs();
            const expiryTime = now.subtract(5, 'minutes');
            const createdDate = dayjs(user?.createdAt);
            if (createdDate.isBefore(expiryTime)) {
                return res.json({
                    message: "OTP has expired"
                });
            }
        }

        const hashedOtp = hashOTP(otp);

        if(user != null && user.otp === hashedOtp){
            await prismaClient.$transaction(async tx => {
                await tx.user.create({
                    data: {
                        email
                    }
                }),
    
                await tx.unverifedUser.delete({
                    where: {
                        email
                    }
                })
            })

            const token = jwt.sign({
                email
            }, process.env.JWT_SECRET as string);
            
            res.json({
                message: "Login successful.",
                token
            })
        }
        else{
            return res.status(401).json({
                message: "Login unsuccesfull",
                token: ""
            })
        }
    } catch (error) {
        console.log(error);
        res.json(error);
    }
})