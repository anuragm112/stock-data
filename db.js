const mongoose=require('mongoose');
const db=async()=>{
const mongooseUrl="mongodb+srv://anuragmiglani20:HuIxSri07BhBt7Kv@cluster0.10pmvum.mongodb.net/stock-data?retryWrites=true&w=majority";
try{
    const connect=await mongoose.connect(mongooseUrl,{useNewUrlParser: true, useUnifiedTopology: true});
    
       console.log(`MongoDB connected: ${connect.connection.host}`);
    }catch(e){
        console.log(e);
        process.exit(1);
    }
}
module.exports=db;