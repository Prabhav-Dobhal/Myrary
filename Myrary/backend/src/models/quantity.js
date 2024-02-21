const mongoose= require("mongoose");

const adminSchema= new mongoose.Schema({
    quantity:{
        type:Number
    }
})

//collection
const Quantity= new mongoose.model("quantity",adminSchema);

module.exports= Quantity;