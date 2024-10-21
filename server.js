const express=require('express');
const fs = require('fs');
const app=express();
require('dotenv').config();
const db=require('./db');
const PORT=7000;
const stockRoutes=require('./routes/stockRoutes')
app.use(express.json());
app.use('/stocks', stockRoutes);

app.listen(process.env.PORT || 5000,()=>{
    console.log("Server is connected to port: "+PORT ); 
});
db();