//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rahul:atlas123@cluster0-olvuc.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String
};

const Items = mongoose.model("Item", itemsSchema);
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const item1 = new Items({
  name: "Welcome to the todo list"
});

const item2 = new Items({
  name: "Click on the + icon to add another item"
});

const item3 = new Items({
  name: "<-- Check here to delele this item"
});

const defaultItems = [item1, item2, item3];

const listSchema ={
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Items.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Items.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else console.log("Successfully inserted intems into DB!");
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});

app.post("/", function(req, res) {
  const listName = req.body.list;
  const itemName = req.body.newItem;

  const item = new Items({
    name: itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);

    });
  }

});

app.post("/delete",function(req,res){
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
  Items.findByIdAndRemove(id,function(err){
    if(err)console.log(err);
    else{ console.log("Successfully deleted!");
    res.redirect("/");}
  });
}else{
  List.findOneAndUpdate({name: listName},{$pull:{items:{_id: id}}},function(err,foundList){
    if(!err){
    res.redirect("/"+listName);
  }
});

}


});

app.get("/:cutomListName",function(req,res){
    const heading = _.capitalize(req.params.cutomListName);
    List.findOne({name: heading},function(err,foundList){
      if(!err){
        if(!foundList){
          //Create a new list
          const list = new List({
            name: heading,
            items: defaultItems
          });
          list.save();
          res.redirect("/"+heading);
        //console.log("Doesn't exist");
      }
      else{
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }// console.log("Exists!");
      }
    });


});


app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started Successfully");
});
