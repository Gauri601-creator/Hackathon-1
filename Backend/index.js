const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Stock = require("./models/Stocks");
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
mongoose.connect('mongodb://127.0.0.1:27017/Stock')
  .then(() => console.log('Connected!'));





app.get("/", (req,res)=> {
    res.render("dashboard")
});

// Adding stocks
app.get("/add", (req,res)=> {
    res.render("add.ejs")
});
app.post("/add", async (req, res) => {
    const stock = new Stock(req.body);
    await stock.save();

    res.redirect("/stocks");
});

app.get("/stocks", async (req, res) => {
    const stocks = await Stock.find();
    res.render("stocks", { stocks });
});


app.listen(8080,(port) => {
    console.log("Server running on port: 8080");
})