//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const { Template } = require("ejs");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Ravi:Rc17@lpu@cluster0.lm5vf.mongodb.net/toDoList?retryWrites=true&w=majority",{useUnifiedTopology: true, useNewUrlParser: true});
const itemSchema = new mongoose.Schema({
  do:String
})

const Item = mongoose.model("Item", itemSchema);

const item1= new Item({
  do: "Welcome to your ToDoList"
});

const item2= new Item({
  do: "Hit + button to add new Item"
});

const item3= new Item({
  do: "<-- hit this to delete item"
});

const itemsArray = [item1,item2,item3];

const listSchema = {
  name: String,
  items : [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err, results){
    if(results.length===0){
      Item.insertMany(itemsArray, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved default");
        }
      });
      res.redirect("/");
    }
    else
    res.render("list", {listTitle: "Today", newListItems: results});
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const nItem = new Item({
    do: itemName
  })

  if(listName==="Today"){
    nItem.save();
    res.redirect("/");
  }else{
    List.findOne({name : listName}, function(err, foundList) {
      foundList.items.push(nItem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete",function(req, res){
  const checkedItem = req.body.checkbox;
  const itemTitle = req.body.listName;

  if(itemTitle==="Today"){
    Item.findByIdAndRemove(checkedItem, function(err){
      if(err)
        console.log(err);
      else{
        console.log("Deleted");
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name: itemTitle}, {$pull: {items: {_id: checkedItem}}}, function(err, foundList) {
      if(!err){
        res.redirect("/"+itemTitle);
      }
    });
  }
  
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: itemsArray
        });
        list.save();
        res.redirect("/"+customListName);
      }else {
        res.render("list", {listTitle: customListName, newListItems: foundList.items});
      }
    }
  });
})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
