// const express=require('express') ...inorder to change this statement,
// define "type":"module" in the pacake.json file
// the the syntax becomes as follows
// morgan is also installed as a package as it helps to show the api request

import express from 'express'
import colors from 'colors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'

// configuring the env file, as this is in some different folder, so we need to specify path
// not here in our case it is in the sam root so we need not define
dotenv.config()

// configure the database
connectDB();

// creating a rest object, to create the api
const app=express();

// middleware
app.use(express.json())
app.use(morgan('dev'))
// initially we used body parser but now we get the feature off express.json() so we use it

// routes
app.use('/api/v1/auth',authRoutes);

// rest api
app.get('/',(req,res)=>{
    // res.send({
    //     message:"Welcome to the College Market"
    // })
    res.send("<h1>welcome to the universitas mercatus</h1>")
})

// PORT
//  we need to secure this port number,so we will be storing this in the .env file
const PORT= process.env.PORT;

// run listen
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`.bgCyan.white);
})


