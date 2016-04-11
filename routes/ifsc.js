var mongo = require('mongodb');
var node_xj = require("xls-to-json");
var mongoServer = mongo.Server,
    mongoDb = mongo.Db,
    BSON = mongo.BSONPure;
var id="0";
var dbName = 'ifsc';
var hostName = 'localhost';
var collection = 'ifsc_dtl';
var server = new mongoServer(hostName,27017,{auto_reconnect:true});

var db = new mongoDb(dbName,server);

/*open connection to db;*/
db.open(function(err,db){
    if(!err){
        console.log("Success : Connected to ifsc Database..!!");
        db.collection(collection, {strict:true}, function(err,collection){
         if(err){
             console.log("WARN : Cannot find ifsc_dtl, So creating one..!!");
             populateDb();
         }
         });
    } else {
        console.error("Error : " + err.toString());
    }

});

/*find documents with ifsc code*/
exports.findByIfscCode = function(req, res, next){
    id ="0";
		res.header("Access-Control-Allow-Origin",  "*");
    if(req.method === "GET"){
        id = req.params.ifscCode;
    }else if(req.method === "POST"){
        id = req.body.ifscCode;
    }
    db.collection(collection,function(err,collection){
        if(!err){
            collection.find({'IFSC': id}).toArray(function(err,items){
                if(!err){
                    res.send(items);
                }
            });
        }
    });
};

/*get bank list with state name*/
exports.getListOfBankByState = function(req, res, next){
    state ="0";
		res.header("Access-Control-Allow-Origin",  "*");
    if(req.method === "GET"){
        state = req.params.state;
    }else if(req.method === "POST"){
        state = req.body.state;
    }
    db.collection(collection,function(err,collection){
        if(!err){
            collection.find({'STATE': state}).toArray(function(err,items){
                if(!err){
                    res.send(items);
                }
            });
        }
    });
};
/*get bank list with district name*/
exports.getListOfBankByDistrict = function(req, res, next){
    district ="0";
		res.header("Access-Control-Allow-Origin",  "*");
    if(req.method === "GET"){
        district = req.params.district;
    }else if(req.method === "POST"){
        district = req.body.state;
    }
		district = district.toUpperCase();
    db.collection(collection,function(err,collection){
        if(!err){
            collection.find({'DISTRICT': district}).toArray(function(err,items){
                if(!err){
                    res.send(items);
                }
            });
        }
    });
};
/*find documents with micr code*/
exports.findByMicrCode = function(req, res, next){
    micrCode ="0";
		res.header("Access-Control-Allow-Origin",  "*");
    if(req.method === "GET"){
        micrCode = req.params.micrCode;
    }else if(req.method === "POST"){
        micrCode = req.body.micrCode;
    }
		micrCode = micrCode.toUpperCase();
    db.collection(collection,function(err,collection){
        if(!err){
            collection.find({'MICR CODE': micrCode}).toArray(function(err,items){
                if(!err){
                    res.send(items);
                }
            });
        }
    });
};

/*find documents with bank name*/
exports.findByBank = function(req, res, next){
    bankName = req.params.bank;
		bankName = bankName.toUpperCase()
		res.header("Access-Control-Allow-Origin",  "*");
    db.collection(collection,function(err,collection){
        if(!err){
					  collection.distinct("BRANCH",{"BANK": bankName},{"BRANCH":1} ,function(err, items){
							if(!err){
									if (items.length > 0)
										res.send({"status": "success",  "data":items});
									else
										res.send({"status": "failed", "message":"No data found"});

							}else{
										res.send({"status": "failed", "message":"Somthing went wrong. Please try again."});
							}
             });
        }
    });
};

/*find documents with branch name*/
exports.findByBranch = function(req, res, next){
	  console.log("Inside findByBranch");
    branchName ="0";
		res.header("Access-Control-Allow-Origin",  "*");
    if(req.method === "GET"){
        branchName = req.params.branch;
    }else if(req.method === "POST"){
        branchName = req.body.branch;
    }
		branchName = branchName.toUpperCase();
    db.collection(collection,function(err,collection){
        if(!err){
            collection.find({'BRANCH': branchName}).toArray(function(err,items){
                if(!err){
									  if (items.length > 0)
                      res.send(items);
						        else
                      res.send({"status": "failed", "message":"No data found"});

                }else{
                      res.send({"status": "failed", "message":"Somthing went wrong. Please try again."});
								}
            });
        }
    });
};

/*get list of bank name*/
exports.listBanks = function(req, res, next){
    id ="0";
		res.header("Access-Control-Allow-Origin",  "*");
    db.collection(collection,function(err,collection){
        if(!err){
					  collection.distinct("BANK", function(err, items){
							if(!err){
									if (items.length > 0)
										res.send({"status": "success",  "data":items});
									else
										res.send({"status": "failed", "message":"No data found"});

							}else{
										res.send({"status": "failed", "message":"Somthing went wrong. Please try again."});
							}
             });
        }
    });
};

exports.findbyBankBranch = function(req, res, next){
    bankName = req.params.bankname;
    branchName = req.params.branchname;
    console.log(bankName + "   " + branchName);
		res.header("Access-Control-Allow-Origin",  "*");
    db.collection(collection,function(err,collection){
        if(!err){
					  collection.findOne({"BANK" : bankName, "BRANCH" : branchName},  function(err, items){
							if(!err){
								 if(items){
										items.MICRCODE = items['MICR CODE']
										res.send({"status": "success",  "data":items});
									}else{
										res.send({"status": "failed", "message":"No data found"});
									}
							}else{
										res.send({"status": "failed", "message":"Somthing went wrong. Please try again."});
							}
             });
        }
    });
};
/*insert data to ifsc_dtl collection from the.xls file*/
var fs = require('fs');
function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
populateDb = function(){
    var fDirName = '/rbi/';
    var userHome = getUserHome();
    console.log(userHome+fDirName);
    function getFiles (dir, files_){
        files_ = files_ || [];
        var files = fs.readdirSync(dir);
        for (var i in files){
            var name = dir + '/' + files[i];
            if (fs.statSync(name).isDirectory()){
                getFiles(name, files_);
            } else {
                files_.push(name);
                node_xj({
                    input: name,  // input xls
                    output: userHome+'/json/json.json'// output json
                }, function(err, result) {
                    if(err) {
                        console.error(err);
                    } else {
                        db.collection(collection,function(err,collection){
                            if(!err){
                                collection.insert(result,{safe:true},function(err,items){
                                    if(!err){
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
        return files_;
    }
    getFiles(userHome+fDirName);
};
