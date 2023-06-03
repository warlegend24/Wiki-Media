//server starting code :-


//requiring all the installed modules :-
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const express = require("express");
const ejs = require("ejs");


//setting up all the modules:-

//setting up express:-
//instantiating the app using the express variable:-
const app = express();

//setting up ejs:-
app.set("view engine","ejs");

//setting up body-parser :- 
app.use(bodyParser.urlencoded({extended:true}));


app.use(express.static("public"));

//initialising the database code in the server:-

//step 1 :- creating a connection 
//hosting the mongodb online using Atlas:-
mongoose.connect('mongodb+srv://Harman:Cricketer24@cluster0.mdmqurh.mongodb.net/wikiDB')

.then(function(res){
    console.log("successfully connected to the database server")
})
.catch(function(err){
    console.log(err);
});

//step 2:- creating a Schema :-

const articleSchema = new mongoose.Schema({
    title:String,
    content:String
});

//step 3:- creating a model from this schema i.e. blueprint of the documents:-

const Article = mongoose.model("Article",articleSchema);

//now we can create documents using this model and save in our database:-

//HOME PAGE :-
app.get("/",function(req,res){
    res.render("home");
});

//Add new Article :-
app.get("/articles/Add_new_article",function(req,res){
    res.render("Add-new-article");
});

//Delete all articles
app.get("/delete_all_articles",function(req,res){
    //deleting all the doucments in the 'articles' collection
    Article.deleteMany({})
    .then(function(deleted){
        res.render("Deleted-Successfully");
    })
    .catch(function(err){
        res.send(err);
    });
    
});

//Deleting a Specific Article:-

app.get("/article/delete_specific_article",function(req,res){
    res.render("Delete_Specific");
});

app.post("/delete_one_article",function(req,res){
    Article.deleteOne({title:req.body.title})
    .then(function(deleted){
        console.log(deleted);
        res.render("Deleted_One_Successfully");
    })
    .catch(function(err){
        res.send(err);
        console.log(err);
    });
});

app.get("/article/fetch_specific_article",function(req,res){
    res.render("Fetch_Specific");
});

app.post("/fetch_one_article",function(req,res){
    //now we find the document in the 'articles' collection using the 'title' of the article entered by the user:-
    Article.findOne({title:req.body.title})
    .then(function(article_found){
        if(article_found===null){
            res.send("Article Not Found !!");
        }
        res.render("Fetched_Article",{article_found:article_found});
    })
    .catch(function(err){
        res.send(err);
    });
});

app.get("/article/replace_an_article",function(req,res){
    res.render("Replace_Specific");
});
app.post("/replace_one_article",function(req,res){
    //'put' request functionality :-
    Article.replaceOne(
        {title:req.body.replace_title},
        {title:req.body.updated_title,
         content:req.body.updated_content 
        }
    ).then(function(updated){
        console.log(updated);
        res.render("Replaced_Successfully");
    })
    .catch(function(err){
        console.log(err);
        res.send(err);
    });

});

//Updating an article:-

app.get("/article/update_an_article",function(req,res){
    res.render("Update_specific");
});

app.post("/update_one_article",function(req,res){
    //"patch" http request functionality :-
    Article.updateOne({title:req.body.update_title},{title:req.body.new_title,content:req.body.new_content})
    .then(function(updated){
        console.log(updated);
        res.render("Updated_Successfully");
    })
    .catch(function(err){
        console.log(err);
        res.send(err);
    });
});

//SETTING UP THE RESTFUL API 

//IMPLEMENTING THE HTTP VREBS:-

//using the app.route() function to implement chainable route handlers so that we can select a particular route
//and specify all the type of requests on that route under this function targeting the route:-

app.route("/articles")
   .get(function(req,res){
    //find all data from database and return it:-
    Article.find({})
    .then(function(articles){
        res.render("Read_all_Articles",{articles:articles});
    })
    .catch(function(err){
        res.send(err);
    });
   }
   )

   .post(function(req,res){
    //creating new document accoring to the data passed by the client to server through the req via API:-
    const newArticle = new Article({
        title:req.body.title,
        content:req.body.content
    });
    //saving the document/article in the 'articles' collection in the wikiDB database:-
    newArticle.save()
    .then(function(saved){
        res.render("Added-Successfully")
    })
    .catch(function(err){
        res.send(err);
    });
   })

   .delete(function(req,res){
    //deleting all the doucments in the 'articles' collection
    Article.deleteMany({})
    .then(function(deleted){
        res.send("Successfully deleted all the documents in the articles collection in the wikiDB database");
    })
    .catch(function(err){
        res.send(err);
    });

   });





   //now if the user/client trie to access a particular route more specific route targeting one or more than one documents in the collection in the database:-

   app.route("/articles/:article_title")
   .get(function(req,res){
    //now we find the document in the 'articles' collection using the 'title' of the article specified as a routing parameter in the route path:-
    const required_title = req.params.article_title;
    Article.find({title:required_title})
    .then(function(article_found){
        res.send(article_found);
    })
    .catch(function(err){
        res.send(err);
    });
   })

   .put(function(req,res){
    //we find the document to be updated by using the express routing parameters and the mongoose update method:-
    Article.replaceOne(
        {title:req.params.article_title},
        {title:req.body.title,
         content:req.body.content 
        }
    ).then(function(updated){
        console.log(updated);
        res.send("Successfully implemented the 'put' operation / replaced the specified document with the data passed through the request");
    })
    .catch(function(err){
        console.log(err);
        res.send(err);
    });
   })

   .patch(function(req,res){
    //now we find the document /article in the 'articles' collection and update it with the data passed by the client/user in the 'req' via the API:
    Article.updateOne({title:req.params.article_title},{title:req.body.title,content:req.body.content})
    .then(function(updated){
        console.log(updated);
        res.send("Successfully updated the required document using the 'patch' http request operation");
    })
    .catch(function(err){
        console.log(err);
        res.send(err);
    });
   })

   .delete(function(req,res){
    //finding the specific document in the articles collection and deleting it using the mongoose deleteone operation:
    Article.deleteOne({title:req.params.article_title}).then(function(deleted){
        console.log(deleted);
        res.send("Succ`essfully deleted the required document from the 'articles' collection in wikiDB");
    })
    .catch(function(err){
        res.send(err);
        console.log(err);
    });
   });














// //get i.e 'read' operation

// app.get("/articles",function(req,res){
//     //then we read and fetch all the articles from our database:-
//     Article.find({})
//     .then(function(articles){
//         res.send(articles);
//     })
//     .catch(function(err){
//         console.log(err);
//     });

// });


// //'post' request i.e HTTP 'Create' verb in the RESTful API meaning:-

// app.post("/articles",function(req,res){

//     //using the data passed by the client to the server via the API :-
//     //creating a new document/article:-
//     const newArticle = new Article({
//         title:req.body.title,
//         content:req.body.content
//     });
//     //now saving this document into the articles collection in our WikiDB :-
//     newArticle.save()
//     .then(function(new_article){
//         res.send("Successfully saved the new Article in the database");
//     })
//     .catch(function(err){
//         res.send(err);
//     });


// });

// //Handling the 'delete' http request to our server:-

// app.delete("/articles",function(req,res){

//     //now how do we delete all the article documents in the Article Model referring to the 'articles' collection ..
//     //mongodb database functioning :- 

//     Article.deleteMany({})
//     .then(function(deletion){
//         res.send("Successfully deleted all the documents/articles in the articles collection");
//     })
//     .catch(function(err){
//         res.send(err);
//     });
// });

















app.listen(3000,function(){
    console.log("Server started on port 3000")
});


