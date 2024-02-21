const mongoose= require("mongoose");

const adminSchema= new mongoose.Schema({
    book:{
        type:String
    },
    quantity:{
        type:Number
    }
})

//collection
const Book= new mongoose.model("book",adminSchema);

module.exports= Book;