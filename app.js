const express =  require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require('dotenv').config(); 

const M_URl = process.env.MONGODB_URL;



const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemsSchema = {
    name: String
}
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your to do list"
})
const item2 = new Item({
    name: "hit +"
})
const item3 = new Item({
    name: "del"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("list", listSchema);
// Item.insertMany(defaultItems)
//     .then(() =>{
//         console.log("data inserted");
//     }).catch((err) =>{
//         console.log(err);
//     })

app.get("/",function(req,res){
    
    Item.find({}).then(function(foundItems){
        if(foundItems.length === 0){

            Item.insertMany(defaultItems);
    res.redirect("/");
        }
        else{
            res.render("list",{listTitle :"Today", newListItems :foundItems });
            
        }
        console.log("data inserted");
        
     }).catch(function(err){
        console.log(err);
     });
    
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}).then(function(foundList){
        if(!foundList){
            const list = new List({
        name: customListName,
        items: defaultItems
                 
    });
        list.save();
        res.redirect("/"+customListName);
       
        }
        else{
            res.render("list",{listTitle :foundList.name, newListItems :foundList.items });
        }
    });
    
});


app.post("/", function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });
    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName}).then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);

        })
    }
    
    
});
app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId).then(function(){
        console.log("sucessfully deleted checked item");
    }).catch(function(err){
        console.log(err);
    });
    res.redirect("/")
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedItemId }}}).then(function(){
            res.redirect("/"+listName);
        })
    }
    
})





app.get("/work",function(req, res){
    res.render("list",{listTitle : "work", newListItems : workItems })
})


app.listen(process.env.PORT ||3000, function(){
    console.log("server starting at port 3000");
})
