import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import { userRouter } from './routes/user';
import { otpRateLimit } from './middlewares/otpRateLimit';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use('/api', otpRateLimit, userRouter);

app.get('/', (req, res)=>{
    return res.json({status: "healthy"});
})

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));