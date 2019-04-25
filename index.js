const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash')

const app = express();
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
  extended: true
}));

const productionDB = "mongodb+srv://ademola:Password123@cluster0-nyquh.mongodb.net/todoListDB";
const localDB = "mongodb://localhost:27017/todoListDB";

app.use(express.static("public"));
mongoose.connect( localDB, {
  useNewUrlParser: true
});

const ItemsSchema = new mongoose.Schema({ name: String })

const Item = mongoose.model("Item", ItemsSchema);

const item1 = new Item({
  name: "welcome to your todolist"
})

const item2 = new Item({
  name: "Add your new items"
})

const item3 = new Item({
  name: "Pick one"
})

const defaultItems = [item1,item2, item3];

const listSchema = {
  name: String,
  items: [ItemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get('/', function(req, resp) {
  Item.find({}, function(err, foundItems){
  resp.render("list", { day: "Today", listItem: foundItems} );

  })
})

app.post('/', function(req, resp) {
  const itemName = req.body.todo;
  const listName = req.body.list;

  console.log(itemName);
  itemNew = new Item({
    name: itemName
  });

  if (listName === "Today") {
    itemNew.save();
    resp.redirect('/');

  } else {
    List.findOne({name: listName}, function(err, foundlist){
      foundlist.items.push(itemNew);
      foundlist.save();
      resp.redirect('/' + listName)
    })

  }


  // resp.render("list", { day: "Today", listItem: itemName})
  });

  app.post('/delete', function(req, resp){
    const checkboxId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
      Item.findByIdAndRemove(checkboxId, function(err){
        if (!err) {
            console.log('successfully deleted');
            resp.redirect('/');
        }
      });

    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkboxId} }}, function(err, foundlist){
        if (!err) {
          resp.redirect('/' + listName )
        }
      });
    }

  })


  // var item4 = req.body.todo;
  // console.log(req.body.list)
  // if(req.body.list === "Work"){
  //   listItem.push(item4)
  //   resp.redirect('/work');
  // }else{
  //   // var foundItems = "";
  //   listItem.push(foundItems)
  //   resp.redirect('/');
  // }


app.get('/:customerListName', function(req, resp){
  const customerListName = _.capitalize(req.params.customerListName);

  List.findOne({name: customerListName}, function(err, foundlist){
    if (!err) {
      if (!foundlist){
        console.log("Doesn't exist!");
        // Create list
        const list = new List({
          name: customerListName,
          items: defaultItems
        })
        list.save();
        resp.redirect('/' + customerListName)

      }else{
        resp.render("list", {day: foundlist.name , listItem: foundlist.items} )
      }
    }
  })

})

let port = process.env.PORT;

if(port == null || port == ""){
  port = 5000
}


app.listen(port, function() {
  console.log('Server has started successfully')
})
