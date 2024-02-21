const mongoose= require("mongoose");

const adminSchema= new mongoose.Schema({
    name:{
        type:String
    },
    phoneno:{
        type:Number
    },
    email :{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

//collection
const login= new mongoose.model("login",adminSchema);

module.exports= login;