const mongoose= require("mongoose");

const adminSchema= new mongoose.Schema({
    username:{
        type:String
    },
    phoneno:{
        type:String
    },
    books: [{
        type:String
    }]
})

//collection
const Issued= new mongoose.model("issuedbook",adminSchema);

module.exports= Issued;