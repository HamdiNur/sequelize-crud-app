 require('dotenv').config({path:`${process.cwd()}/.env`})
const express=require("express")
const authRouter=require("./routes/authRoute")
const app=express();


app.use(express.json());

app.get("/",(req,res)=>{
 res.status(200).json({
    status:'success',
    message:'waaaaaw ! RestApi is working'
 })
})
//all routes will be here 
app.use('/api/v1/auth',authRouter)

app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route Not Found'
  });
});

const PORT=process.env.APP_PORT||3000
app.listen(PORT,()=>{
    console.log("server up is running up",PORT)
})

