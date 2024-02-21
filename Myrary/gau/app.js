const express = require("express");
const async = require("hbs/lib/async");
const app =express();
const path= require("path");
const hbs=require("hbs");
require("./db/conn");
const Login= require("./models/adminlogin");
const Book=require("./models/books");
const Quantity = require("./models/quantity");
const Issuedbooks= require("./models/issuedbooks");
const mongoose = require("mongoose");
const NotReturned= require("./models/notreturned");
const bodyParser = require("body-parser");


const port=process.env.PORT ||3000;
const static_path= path.join(__dirname, "../public");
app.use(express.static(static_path));
app.set("view engine","hbs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.get('/',(req,res)=>{
    res.render("index")
});
app.get("/addbook",(req,res)=>{
    res.render("addbook");
});
app.post("/addbook",async(req,res)=>{
    try{
        const bookname=req.body.bookname;
        const quantity=parseInt(req.body.quantity);

        const user= await Book.findOne({book:bookname});
        if(!user){
            //add book
            const newbook=new Book({
                book:bookname,
                quantity:quantity,
            });
            await newbook.save();

             // Update the quantity in the quantitys collection
             const quantityEntry = await Quantity.findOne({});
             if (!quantityEntry) {
                 // If there is no quantitys entry yet, create a new one
                 const newQuantityEntry = new Quantity({
                     quantity: quantity,
                 });
                 await newQuantityEntry.save();
             } else {
                 // If there is already a quantitys entry, update its quantity value
                 quantityEntry.quantity += quantity;
                 await quantityEntry.save();
             }
        }
        else{
            //bound already exists increment quantity
            user.quantity+=quantity;
            await user.save();

            // Update the quantity in the quantitys collection
            const quantityEntry = await Quantity.findOne({});
            if (!quantityEntry) {
                // If there is no quantitys entry yet, create a new one
                const newQuantityEntry = new Quantity({
                    quantity: quantity,
                });
                await newQuantityEntry.save();
            } else {
                // If there is already a quantitys entry, update its quantity value
                quantityEntry.quantity += quantity;
                await quantityEntry.save();
            }
        }
        res.render("booksaddsuccess");
    }
    catch(e){
        res.send("Server Error"+e);
    }
})


app.get("/index",(req,res)=>{
    res.render("index");
});
app.post("/index",async(req,res)=>{
    try{
        const email= req.body.adminemail.toLowerCase();
        const password= req.body.adminpassword;

        const useremail=await Login.findOne({email:email});
        if(!useremail){
            res.status(400).send("Invalid Email.")
        }
        else{
            if(useremail.password===password){
                res.redirect("homepage");
            }
            else{
                res.send("Invalid password");
            }
        }
    }catch(e){
        res.status(400).send("Invalid Credentials.")
    }
})
app.get("/changecred",(req,res)=>{
    res.render("changecred");
});

app.post("/changecred",async(req,res)=>{
    try{
        const name=req.body.name.toLowerCase();
        const phoneno=req.body.phoneno;
        const email=req.body.email.toLowerCase();

        const user=await Login.findOne({email:email});

        if(!user){
            res.send("Email doesnt found in the database please recheck it.");
        }
        else{
            user.name=name;
            user.phoneno=phoneno;
            await user.save();
            res.send("Details Updated Successfully");
        }
    }
    catch{
        res.send("Server Error");
    }
})


app.get("/issue",async(req,res)=>{
    try{
        const books= await Book.find({quantity: {$gt:0}});
        res.render("issue",{books});
    }
    catch(e){
        res.send("Error:"+e);
    }
});

app.post("/issue", async (req, res) => {
    try {
        const selectedbooks = req.body.books;
        if (!selectedbooks) {
            return res.send("NO books selected!");
        }
        const username=req.body.username;
        const phoneno=req.body.phoneno;
        console.log(username);
        const BooksArry=[];
        for (const bookID of selectedbooks) {
            if (mongoose.Types.ObjectId.isValid(bookID)) {
                const validbookid = new mongoose.Types.ObjectId(bookID);

                const BOOK = await Book.findById(validbookid);
                if (BOOK) {
                    BOOK.quantity -= 1;
                    await BOOK.save();
                } else {
                    return res.send("Books not found!");
                }
                BooksArry.push(BOOK.book);
            } else {
                return res.send("Invalid Book ID");
            }
        }
        //save user credentials
        try{
        const issuedBooksEntry = new Issuedbooks({
            username: username,
            phoneno: phoneno,
            books: BooksArry, // Store the array of issued books
        });
        await issuedBooksEntry.save();
        }
        catch(e){
            console.log(e);
        }
        //update quantity
        const QUANTITY = await Quantity.findOne();
        if (QUANTITY) {
            QUANTITY.quantity -= selectedbooks.length;
            await QUANTITY.save();
        } else {
            return res.send("Quantity decrement error");
        }
        const NOTRETURNED= await NotReturned.findOne();
        if(NOTRETURNED){
            // console.log(NOTRETURNED);
            NOTRETURNED.quantity+= selectedbooks.length;
            await NOTRETURNED.save();
        }
        else{
            return res.send("Not returned update error");
        }
        res.redirect("homepage");
    } catch (e) {
        res.send("Error:" + e);
    }
});




app.get("/viewbooks",async(req,res)=>{
    try{
        const books= await Book.find();
        res.render("viewbooks",{books});
    }
    catch(e){
        res.send("Error:"+e);
        res.status(500).send("Error:" + e);
    }
});
app.get("/changepass",(req,res)=>{
    res.render("changepass");
});

app.post("/changepass",async(req,res)=>{
    try{
    const email=req.body.email.toLowerCase();
    const password=req.body.password;
    
    const user=await Login.findOne({email:email});
    if(!user){
        res.send("Invalid Email");
    }
    else{
        user.password=password;
        await user.save();
        res.send("Password Updated Successfully.");
    }
    }
    catch(e){
        res.send("server error:"+e);
    }
})

app.get("/homepage",async(req,res)=>{
    try{
        const quantity= await Quantity.findOne();
        const q= quantity? quantity.quantity : 0;
        const notreturned= await NotReturned.findOne();
        const nr= notreturned? notreturned.quantity :0;
        res.render("homepage",{q,nr});
    }
    catch(e){
        res.status(500).send("Internal Server Error!!!!");
    }
});

app.listen(port,()=>{
    console.log(`server is running at ${port}`);
});