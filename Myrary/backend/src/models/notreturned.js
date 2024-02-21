const mongoose= require("mongoose");

const adminSchema= new mongoose.Schema({
    quantity:{
        type:Number
    }
})

//collection
const NotReturned= new mongoose.model("notreturned",adminSchema);

module.exports= NotReturned;