const mongoose=require("mongoose");
mongoose.connect("mongodb://localhost:27017/myrary")
.then(()=>{
    console.log(`mongo is connectedddd`);
}).catch((e)=>{
    console.error(e);
    console.log("not connected");
})
