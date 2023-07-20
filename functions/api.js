//jshint esversion:6

const express = require("express");
const bodyparser =  require("body-parser");
const req = require("express/lib/request");
const mongoose = require("mongoose")
const app = express();
const _ = require("lodash")
require("dotenv").config()
const mongourl = process.env.mongoid
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static('public'));

console.log(mongourl)

mongoose.connect(mongourl);

mongoose.connection.on("connected",function() {
    console.log("Connected to database")
})

const ItemsSchema = {
    name : String
};

const Item = mongoose.model("Item",ItemsSchema)

const item1 = new Item ({
    name :"Welcome to your todolist",
})

const item2 = new Item ({
    name : "Hit the + button to add a new item.",
})

const item3 = new Item ({
    name : "<-- Hit this to delete an item",
});

const defaultItems =[item1,item2,item3];

// Item.insertMany(defaultItems)
const listSchema = {
    name : String,
    items : [ItemsSchema]
}

const List =mongoose.model("List",listSchema)


app.get("/",function(req,res){
    items = Item.find({}).then(function(data,err){
        if(err) console.log(err);
        else {
            if(data.length == 0) {
                Item.insertMany(defaultItems)
                res.redirect('/')
            }
            else {
                res.render("index",{listTitle: "Today", newListItem : data});
            }
        }
    })
    // console.log(items);
})

app.get("/:customListName",function(req,res) {
    const customListName = req.params.customListName;
    List.findOne({'name': customListName}).then(function(data){
        if(data) {
            res.render("index",{listTitle: _.capitalize(data.name), newListItem : data.items})
        }
        else {
            // console.log("does not exixts")
            const list = new List({
            name : customListName,
            items : defaultItems
            });
            list.save()
            res.redirect('/')
        }
    })
})



app.post("/",function(req,res){
    const itemname = req.body.newItem
    const listname = req.body.button
    // console.log(listname)
    // console.log(req.body.newItem)
    const newitem = new Item ({
        name : req.body.newItem
    })

    if( listname == "Today") {
        newitem.save()
        res.redirect("/")
    }
    else{
        const liItem = _.lowerCase(listname)
        // console.log(listname)
        List.findOne({name : liItem}).then(function(data) {
            // console.log(data)
            data.items.push(newitem);
            data.save()
            res.redirect("/" + liItem)
        })
    }
    

})

app.post("/delete",function(req,res) {
    const checkedbox = req.body.checkbox;
    const listName = req.body.listname;
    // console.log(checkedbox)
    // console.log(listName)
    if(listName == "Today") {
        Item.findById(checkedbox).then(function(data) {
            Item.deleteOne(data).then(function() {
                console.log("Item deleted")
            })
            res.redirect('/')
        }).catch(function(err) {
            console.log(err)
        })
    } else {
        const liItem = _.lowerCase(listName)
        List.findOneAndUpdate({'name' : liItem},{$pull: {items: {_id: checkedbox}}}).then(function(data){
            if(data!=null){
                res.redirect("/" + liItem)
            }
        })
    }
})

app.listen(3000,function(){
    console.log("The server is started at port 3000..........");
})