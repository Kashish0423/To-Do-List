

const express = require("express");
const bodyParser = require("body-parser");


const app = express();

const mongoose= require("mongoose") ;

const lodash= require("lodash") ;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


require('dotenv').config() ;

const pass= process.env.PASSWORD ;
const username= process.env.USER_id ;



const uri= 'mongodb+srv://'+username+':'+pass+'@cluster0.y7ktc.mongodb.net/todoListDB?poolSize=4' ;

mongoose.connect( uri, { useNewUrlParser: true , useUnifiedTopology: true}).

    catch(error => handleError(error));

    // Or:
    try {
       mongoose.connect(uri, { useNewUrlParser: true });
    } catch (error) {
      handleError(error);
    }

    mongoose.set('useFindAndModify', false);
   
  const ItemsSchema= mongoose.Schema({
    name:String

  }) ;


  const Item= mongoose.model("Item", ItemsSchema) ;


    const Item1= new Item({
    name: "Welcome to your todoList!" 

    }) ;

   const Item2= new Item({
    name: "Hit the + button to add new item to your list." 
    
      }) ;

    const Item3= new Item({
    name: "<-- Hit this to delete an item."
        
    }) ;


    const defaultItems= [Item1, Item2, Item3] ;

  
const listSchema= mongoose.Schema(

  {

    name: String ,
    items: [ItemsSchema] 
  }
)  ;

const List= mongoose.model("List", listSchema) ;
  

app.get("/", function(req, res) {


  Item.find(function(err,items){
  if(err)console.log(err) ;

    else{


     if(items.length===0)
     {

       Item.insertMany(defaultItems, function(err){

       if(err)console.log(err) ;

       else 
       {
       console.log("Default Items Inserted") ;
       }

      }) ;

       res.redirect("/") ;

     }
      else{
        res.render("list", {listTitle: "Today", newListItems: items});
      }

      
      }
  })

 

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const listName= req.body.list ;

 // console.log(listName) ;

  const addItem= new Item({

    name:itemName 
  }) ;

if(listName==="Today")
{
 addItem.save() ;
res.redirect("/") ;

}

else{

List.findOne({name:listName}, function(err,docs){

  if(!err)
  {
      docs.items.push(addItem) ;
        docs.save() ;
      res.redirect("/"+ listName) ;
  }

}) ;

}

  
});


app.post("/delete", function(req,res){



const deleteId= req.body.checkbox ;

const listName= req.body.listName ;


// control flow for redirection 



if(listName==="Today")
{

  Item.deleteOne({_id: deleteId}, function(err){

    if(err)console.log(err) ;
  
    else{
      console.log("Deletion Successful") ;
  
      res.redirect("/") ;
    }
  })  ;
}


else{

List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:deleteId}}}, function(err,findList){

if(!err){

  res.redirect("/"+ listName) ;
}

}) ;


}


}) ;


app.get("/:customListName", function(req, res){

  const customListName= lodash.capitalize(req.params.customListName) ;
  
List.findOne({name:customListName}, function(err, docs){

if(err)console.log(err) ;
else{
  
  if(docs)
  {
    // show the list 

  

    res.render("list", {listTitle: docs.name, newListItems: docs.items});
  }

  else{
      
        const list= new List({

  name: customListName,
  items: defaultItems

  }) ;

list.save() ; 

res.redirect("/"+ customListName) ;

  }

}

});


   

}) ;


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function(){

  console.log("Server started ")
});



