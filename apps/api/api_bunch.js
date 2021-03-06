const express = require('express');
const router=express.Router();
const path=require('path');
const crypto=require('crypto');
const mongoose=require('mongoose');
const multer=require('multer');
const GridFsStorage=require('multer-gridfs-storage');
const Grid=require('gridfs-stream');
const methodOverride=require('method-override');
const Schemas=require('../../models');
//Mongo URI
const mongoURI='mongodb://localhost/Test1';

//Create mongo connection
const conn=mongoose.createConnection(mongoURI);

//Init gfs (girdfs stream part)
let gfs;
let CategoryModel,ExerciseModel; 

// let plz=mongoose.Schema({
// 		category: String,
//     category_desc: String
// 	});
// let plz1=conn.model('zzz',plz);;

conn.once('open',()=>{
	// Init Stream
	console.log("Connected MongoDB ");
	gfs=Grid(conn.db,mongoose.mongo);
	
	CategorySchema=Schemas.createCategorySchema(mongoose);
	ExerciseSchema=Schemas.createExerciseSchema(mongoose);
	//use conn.model instead of moongoose.model becuase of sync problem
	CategoryModel=conn.model("CategoryModel",CategorySchema);
	ExerciseModel=conn.model("ExerciseModel",ExerciseSchema);
	gfs.collection('temp');

	//gfs.collection('test1');
	//gfs.collection('test2');
	//gfs.collection('uploads');
	//gfs.collection('video');
	//gfs.collection('thumbnail');
	//console.dir(mongoose);
	console.log("DB&Stream Service Start")
	//console.log(gfs);
});

// Create storage engine crypto version

// const storage = new GridFsStorage({
//   url: mongoURI,
//   file: (req, file) => {
//     return new Promise((resolve, reject) => {
//       crypto.randomBytes(16, (err, buf) => {
//         if (err) {
//           return reject(err);
//         }
//         const filename = buf.toString('hex') + path.extname(file.originalname);
//         const fileInfo = {
//           filename: filename,
//           bucketName: 'uploads'
//         };
//         resolve(fileInfo);
//       });
//     });
//   }
// });


//Create Storage engine simple version
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    if(file.mimetype==='image/jpeg'||file.mimetype==='image/png'||file.mimetype==='image/jpg'){
    	console.log('image file '+file.originalname+' upload');
    	return{
    		filename:file.originalname,
    		bucketName:'temp'
    	};
    }else if(file.mimetype==='video/mp4'||file.mimetype==='video/avi'){
    	console.log('mp4 file '+file.originalname+' upload');
    	return{
    		filename:file.originalname,
    		bucketName:'temp'
    	};
    }else if(file.mimetype=='text/plain'){
    	console.log('skelton|rgb file '+file.originalname+' upload');
    	return{
    		filename:file.originalname,
    		bucketName:'temp'
    	};
    }
    else{
    	console.log('No support file '+file.originalname+'');
    	return null;
    }
	}	
});

const upload = multer({ storage });

/*-----------------------------------------------------------------get func------------------------------------------------------*/

//route GET/
//@desc Loads form
router.get('/main',(req,res)=>{
	let array=new Array();
	let count=0;
	
	CategoryModel.find(function(err,data){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}else{
			if(data==null){
				array[0]='empty';
				//return res.json('empty');
			}
			for(let i=0;i<data.length;i++) {
				
				array[count++]=data[i].category;
			}
			res.render('main',{categorylist:array});
			//return res.json(array);
		}
	});
	
});

//route GET/
//@desc Loads form
router.get('/category_page',(req,res)=>{
	let array=new Array();
	let count=0;
	
	CategoryModel.find(function(err,data){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}else{
			if(data==null){
				array[0]='empty';
				//return res.json('empty');
			}
			for(let i=0;i<data.length;i++) {
				
				array[count++]=data[i].category;
			}
			res.render('category_page',{categorylist:array});
			//return res.json(array);
		}
	});
	
});

//route GET/
//@desc Loads form
router.get('/exercise_page',(req,res)=>{
	let array=new Array();
	let count=0;

	CategoryModel.find(function(err,data){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}else{
			if(data==null){
				array[0]='empty';
				//return res.json('empty');
			}
			for(let i=0;i<data.length;i++) {
				
				array[count++]=data[i].category;
			}
			res.render('exercise_page',{categorylist:array});
			//return res.json(array);
		}
	});
});


//@route GET/
//@desc Loads form
router.get('/',(req,res)=>{
	gfs.files.find().toArray((err,files)=>{
		//Checkt if files 
		if(!files||files.length==0){
			//err:'No files exist'
			res.render('index',{files:false});
		}else{
			files.map(file=>{
				if(file.contentType==='image/jpeg'||file.contentType==='image/png'){
					file.isImage=true;
				}else{
					file.isImage=false;
				}
			});
			res.render('index',{files:files});
		}

		
	});
});

//@route GET /category/:exericse
//@desc Disyplay exerciselist
router.get('/exerciselist/:category',(req,res)=>{
	let array=new Array();
	let count=0;
	console.log('call exerciselist');
	console.log(req.params.category);
	ExerciseModel.find({'category':req.params.category},function(err,data){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}else{
			if(data==null){
				console.log('emtpy exercise in this category');
				return res.json('empty');
			}else{
				for(let i=0;i<data.length;i++) {
					array[count++]=data[i].exercise;
				}
				console.log(data.length+" find");
				return res.json(array);
			}
		}
	});
});

//@route POST /category/:exericse
//@desc for client exercise info
router.post('/exerciselist_info',(req,res)=>{
	let array=new Array();
	let count=0;
	console.log('call exerciselist_info for client');
	console.log(req.body.category);
	ExerciseModel.find({'category':req.body.category},function(err,data){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}else{
			if(data==null){
				console.log('emtpy exercise in this category');
				return res.json('empty');
			}else{
				 for(let i=0;i<data.length;i++) {
				 	array[count++]=data[i].exercise;
				 }
				console.log("ary ver"+array);
				console.log(data.length+" find");
				return res.json(array);
			}
		}
	});
});

//@route GET /categorylist
//@desc Disyplay categorylist
router.get('/categorylist',(req,res)=>{
	let array=new Array();
	let count=0;
	console.log('call cateogrylist');
	CategoryModel.find(function(err,data){
		console.log(data);
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}else{
			if(data==null){
				return res.json('empty');
			}
			for(let i=0;i<data.length;i++) {
				array[count++]=data[i].category;
			}
			console.log(data.length+' find');
			return res.json(array);
		}
	});
});

//@route GET /files
//#desc Display all files in JSON
router.get('/files',(req,res)=>{
	let array=new Array();
	let count=0;
	gfs.files.find().toArray((err,files)=>{
		console.log('Call DataBase info API');
		//Checkt if files 
		if(err){
			console.oog(err);
			res.status(500).send('Internal Server Error');
		}
		else if(!files||files.length==0){
			return res.status(404).json({
				err:'No files exist'
			});
		}else{
			for(let i=0;i<files.length;i++){
				array[count++]=files[i].filename;
			}
			console.log(array);
			console.log(files.length+' find');
			//Files exist
			return res.json(array);
		}
	});
});

//@route GET /files/"filename"
//#desc Display single file object
router.get('/files/:filename',(req,res)=>{
	gfs.files.findOne({filename:req.params.filename},(err,file)=>{
		//Checkt if file 
		if(!file||file.length==0){
			return res.status(404).json({
				err:'No files exist'
			});
		}
		//File exists
		return res.json(file);
	});
});

//@route GET /image/"filename"
//#desc Display single file object
router.get('/image/:filename',(req,res)=>{
	gfs.files.findOne({filename:req.params.filename},(err,file)=>{
		//Checkt if file 
		if(!file||file.length==0){
			return res.status(404).json({
				err:'No files exist'
			});
		}
		//Check if image
		if(file.contentType=='image/jpeg'||file.contentType=='image/png'||file.contentType=='image/jpg'){
			//Read output to browser
			console.log('call image stream API');
			const readstream=gfs.createReadStream(file.filename);
			readstream.pipe(res);

		}else{
			res.status(404).json({
				err:'Not an image'
			})
		}
		
	});
});



//@route GET /video/"filename"
//#desc Display single file object
router.get('/video/:filename',(req,res)=>{
	gfs.files.findOne({filename:req.params.filename},(err,file)=>{
		
		//Checkt if file 
		if(!file||file.length==0){
			return res.status(404).json({
				err:'No files exist'
			});
		}
		//Check if video
		if(file.contentType=='video/mp4'||file.contentType=='video/avi'){
			//Read output to browser
			console.log('call video stream API');
			const readstream=gfs.createReadStream(file.filename);
			readstream.pipe(res);
			//res.render('player',{movie:res});

		}else{
			res.status(404).json({
				err:'Not an video'
			})
		}
		
	});
});

//@route GET /txt/"filename"
//#desc Display single file object
router.get('/txt/:filename',(req,res)=>{
	console.log('call rgb_skeleton file download api '+req.params.filename);
	gfs.files.findOne({filename:req.params.filename},(err,file)=>{
		//Checkt if file 
		if(!file||file.length==0){
			return res.status(404).json({
				err:'No files exist'
			});
		}
		//Check if txt
		if(file.contentType=='text/plain'){
			//Read output to browser
			console.log('call txt stream API');
			const readstream=gfs.createReadStream(file.filename);
			readstream.pipe(res);

		}else{
			res.status(404).json({
				err:'Not an rgb_skeleton file'
			})
		}
		
	});
});
/*-----------------------------------------------------------------post func------------------------------------------------------*/

//@route POST /category
//@desc upload category to DB
router.post('/category',(req,res)=>{
	console.log('category upload api call')

	CategoryModel.findOne({'category':req.body.category},function(err,data){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}else{
			if(data==null){

				console.log("category  upload "+req.body.category+" "+req.body.desc);
				
				let new_data=new CategoryModel();
				new_data.category=req.body.category;
				new_data.category_desc=req.body.desc;	
				
				new_data.save(function(err,data){
					if(err){
						console.log(err);
						res.status(500).send('Internal Server Error');
					}else{
						console.log('save ok');
						return res.json('save');
					}
				});
			}else{
				console.log("duplicate value is comming.")
				return res.json('duplicate');
			}
		}
	});
	//res.redirect('/HealthCare_API');
	//res.json({file:req.file});
	//return res.status(201);
})


//@route POST /category/update
//@desc update category to DB
router.post('/category/update',(req,res)=>{
	console.log('category update api call')

	CategoryModel.findOneAndUpdate({'category':req.body.category_origin},{'category':req.body.category,'category_desc':req.body.desc},{multi:true},function(err,data)
			{
				if(err){
					console.log(err);
					res.status(500).send('Internal Server Error');
				}
				if(data==null){
					console.log('Nothing to change');
					return res.json('empty');
				}else{

					console.log('Update complete');
					return res.json('update');
				}
			});

	//res.redirect('/HealthCare_API');
	//res.json({file:req.file});
	//return res.status(201);
})

//@route POST /upload

router.post('/file_movie_update',upload.single('file_movie_update'),(req,res)=>{
	console.log("upload file "+req.params);
	res.json('upload file complete');
	//res.redirect('/HealthCare_API');
	//res.json({file:req.file});
})

//@desc Uploads file to DB for unexpected error
router.post('/file_movie_upload',upload.single('file_movie_upload'),(req,res)=>{
	console.log("upload file "+req.params);
	res.json('upload file complete');
	//res.redirect('/HealthCare_API');
	//res.json({file:req.file});
})

//@desc Uploads file to DB for unexpected error
router.post('/upload1',upload.single('file1'),(req,res)=>{
	console.log("upload file "+req.params);
	res.json('upload file complete');
	//res.redirect('/HealthCare_API');
	//res.json({file:req.file});
})


//@desc Uploads file to DB
router.post('/upload',upload.single('file'),(req,res)=>{
	console.log("upload file "+req.params);
	res.json('upload file complete');
	//res.redirect('/HealthCare_API');
	//res.json({file:req.file});
})

router.post('/exercise/movie',(req,res)=>{
	console.log('exercise movie renew api call for '+req.body.exercise_name+' '+req.body.movie_title);

	ExerciseModel.findOneAndUpdate({'exercise':req.body.exercise_name},{'movie_title':req.body.movie_title},{multi:true},function(err,data)
			{
				if(err){
					console.log(err);
					res.status(500).send('Internal Server Error');
				}
				if(data==null){
					console.log('Nothing to change');
					return res.json('empty');
				}else{
					console.log('renew Exercise -movie complete');
					return res.json('renew');
				}
			});

	//res.redirect('/HealthCare_API');
	//res.json({file:req.file});
});

router.post('/exercise/movie/update',(req,res)=>{
	console.log('exercise movie update api call')

	ExerciseModel.findOneAndUpdate({'exercise':req.body.exercise_name},{'movie_title':req.body.movie_title},{multi:true},function(err,data)
			{
				if(err){
					console.log(err);
					res.status(500).send('Internal Server Error');
				}
				if(data==null){
					console.log('Nothing to change');
					return res.json('empty');
				}else{
					gfs.remove({filename:req.body.movie_title,root:'temp'},(err,girdStore)=>{
						if(err){
							return res.status(404).json({err:err});
						}
						console.log('delete for update movie')
						//return res.json('delete');
					});	
					return res.json('update');
				}
			});

	//res.redirect('/HealthCare_API');
	//res.json({file:req.file});
});


//@route POST /exercise/rgb_skeleton
//@desc renew exercise rgb_skeleton data
router.post('/exercise/rgb_skeleton',(req,res)=>{
	console.log('exercise rgb_skeleton_mp4 renew api call for '+req.body.exercise_name+' '+req.body.body_title+' '+req.body.rgb_title+' '+req.body.mp4_title);

	ExerciseModel.findOneAndUpdate({'exercise':req.body.exercise_name},{'body_title':req.body.body_title,'rgb_title':req.body.rgb_title,'mp4_title':req.body.mp4_title},{multi:true},function(err,data)
			{
				if(err){
					console.log(err);
					res.status(500).send('Internal Server Error');
				}
				if(data==null){
					console.log('Nothing to change');
					return res.json('empty');
				}else{
					console.log('renew Exercise -rgb_skeleton_video complete');
					return res.json('update');
				}
			});

	//res.redirect('/HealthCare_API');
	//res.json({file:req.file});
});

//@route POST /exercise/update
//@desc upload exercise to DB
router.post('/exercise/update',(req,res)=>{
	console.log('exercise update api call')

	ExerciseModel.findOneAndUpdate({'exercise':req.body.exercise_origin},{'exercise':req.body.exercise,'exercise_desc':req.body.desc,'image_title':req.body.image_name},{multi:true},function(err,data)
			{
				if(err){
					console.log(err);
					res.status(500).send('Internal Server Error');
				}
				if(data==null){
					console.log('Nothing to change');
					return res.json('empty');
				}else{
					console.log('Update Exercise -text complete');
					gfs.remove({filename:req.body.image_name,root:'temp'},(err,girdStore)=>{
						if(err){
							return res.status(404).json({err:err});
						}
						console.log('exercise image file delete ')
						//return res.json('delete');
					});	
					return res.json('update');
				}
			});

	//res.redirect('/HealthCare_API');
	//res.json({file:req.file});
});

//@route POST /exercise
//@desc upload exercise to DB
router.post('/exercise',(req,res)=>{
	console.log('exercise upload api call')

	ExerciseModel.findOne({'exercise':req.body.exercise},function(err,data){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}else{
			if(data==null){

				console.log("exercise  upload "+req.body.exercise+" "+req.body.desc);
				
				let new_data=new ExerciseModel();
				new_data.category=req.body.category;
				new_data.exercise=req.body.exercise;
				new_data.exercise_desc=req.body.desc;	
				new_data.image_title=req.body.image_name;
				new_data.save(function(err,data){
					if(err){
						console.log(err);
						res.status(500).send('Internal Server Error');
					}else{
						console.log('save ok');
						return res.json('save');
					}
				});
			}else{
				console.log("duplicate value is comming.")
				return res.json('duplicate');
			}
		}
	});
	//res.redirect('/HealthCare_API');
	//res.json({file:req.file});
});


//@route post /category/info
//@desc Display categoryinfo becuase of encoding problem use post method
router.post('/category/info',(req,res)=>{
	console.log('call cateogry info api');
	CategoryModel.findOne({'category':req.body.category},function(err,data){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}else{
			if(data==null){
				return res.json('empty');
			}else{
				return res.json(data);
			}
		}
	});
});

//@route post /exercise/info
//@desc Display categoryinfo becuase of encoding problem use post method
router.post('/exercise/info',(req,res)=>{ //remember key값이름은 보낸곳 기준
	console.log('call exercise info api '+req.body.exercise);
	//console.log('call exercise info api '+req.params.exercise_name);
	ExerciseModel.findOne({'exercise':req.body.exercise},function(err,data){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}else{
			if(data==null){
				return res.json('empty');
			}else{
				console.log(data);
				return res.json(data);
			}
		}
	});
});


//@route post /exerciseinfo/ for client
//@desc Display categoryinfo becuase of encoding problem use post method
router.post('/exerciseinfo',(req,res)=>{ //remember key값이름은 보낸곳 기준
	let array=new Array();
	let count=0;
	console.log('call exercise info api for client '+req.body.exercise_name);
	//console.log('call exercise info api '+req.params.exercise_name);
	ExerciseModel.findOne({'exercise':req.body.exercise_name},function(err,data){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}else{
			if(data==null){
				return res.json('empty');
			}else{
				console.log("original "+data);
				array[0]=data.category;
				array[1]=data.exercise;
				array[2]=data.exercise_desc;
				array[3]=data.image_title;
				array[4]=data.movie_title;
				array[5]=data.mp4_title;
				array[6]=data.body_title;
				array[7]=data.rgb_title;
				console.log("array ver "+array);
				return res.json(array);
			}
		}
	});
});

/*-----------------------------------------------------------------delete func------------------------------------------------------*/
//@route DELETE /delete_rgb_bodydata
//@desc delelte rdb_bodaydata
router.delete('/delete_movie',(req,res)=>{
	console.log('movie delete api call');
	console.log('movie delete '+req.body.exercisename);
	
	ExerciseModel.findOne({'exercise':req.body.exercisename},function(err,data){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}else{
			if(data==null){
				return res.json('empty');
			}else{
				console.log(data);
				let exercise_name=data.exercise;
				let movie_name=data.movie_title;
				ExerciseModel.findOneAndUpdate({'exercise':data.exercise},{"movie_title":""},{multi:true},(err)=>{
					if(err) return handleError(err);
					gfs.remove({filename:movie_name,root:'temp'},(err,girdStore)=>{
						if(err){
							return res.status(404).json({err:err});
						}
						console.log('delete movie file delete '+movie_name);
						return res.json('delete');
					});	
				});
			}
		}
	});
	//return res.json('delete test');
	
});



//@route DELETE /delete_rgb_bodydata
//@desc delelte rdb_bodaydata
router.post('/delete_rgb_bodydata',(req,res)=>{
	console.log('for privacy delte video data too! ');
	console.log('rgb_body_mp4 delete api call');
	console.log('rgb_body_mp4 delete '+req.body.exercisename);
	
	ExerciseModel.findOne({'exercise':req.body.exercisename},function(err,data){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}else{
			if(data==null){
				return res.json('empty');
			}else{
				console.log(data);
				let exercise_name=data.exercise;
				let skelton_name=data.body_title;
				let rgb_name=data.rgb_title;
				let mp4_name=data.mp4_title;
				ExerciseModel.findOneAndUpdate({'exercise':data.exercise},{'body_title':"",'rgb_title':"","mp4_title":""},{multi:true},(err)=>{
					if(err) return handleError(err);
					gfs.remove({filename:rgb_name,root:'temp'},(err,girdStore)=>{
						if(err){
							return res.status(404).json({err:err});
						}
						console.log('delete rgb data '+rgb_name);
						gfs.remove({filename:skelton_name,root:'temp'},(err,girdStore)=>{
						if(err){
							return res.status(404).json({err:err});
						}
							gfs.remove({filename:mp4_name,root:'temp'},(err,girdStore)=>{
							if(err){
								return res.status(404).json({err:err});
							}
						
							console.log('delete mp4 file delete '+mp4_name);
							//return res.json('delete');
							});	
						console.log('delete skelton file delete '+skelton_name);
						return res.json('delete');
					});	
					});	
				});
			}
		}
	});
	//return res.json('delete test');
	
});



//@route DELETE /deleteCategory/:categoryname
//@desc delelte category
router.delete('/deleteCategory/:categoryname',(req,res)=>{
	console.log('categorty delete api call');
	console.log('category delete '+req.params.categoryname);
	CategoryModel.deleteOne({category:req.params.categoryname},(err)=>{
		if(err) return handleError(err);
		return res.json('delete');
	});

});

//@route DELETE /deleteexercise/:exercisename
//@desc delelte exercise
router.delete('/deleteExercise/:exercisename',(req,res)=>{
	

	console.log('exercise delete api call');
	console.log('exercise delete '+req.params.exercisename);

	ExerciseModel.findOne({'exercise':req.params.exercisename},function(err,data){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}else{
			if(data==null){
				return res.json('empty');
			}else{
				console.log(data);
				let image_name=data.image_title;
				ExerciseModel.deleteOne({exercise:req.params.exercisename},(err)=>{
					if(err) return handleError(err);
					gfs.remove({filename:image_name,root:'temp'},(err,girdStore)=>{
						if(err){
							return res.status(404).json({err:err});
						}
						console.log('exercise image file delete ')
						return res.json('delete');
					});	
				});
			}
		}
	});
	
});


//@route DELETE /files/:id
//@desc Delete file
router.delete('/files/:id',(req,res)=>{
	console.log('file delete '+req.params.id);
	gfs.remove({_id:req.params.id,root:'temp'},(err,girdStore)=>{
		if(err){
			return res.status(404).json({err:err});
		}

		res.redirect('/HealthCare_API');
	});
});

module.exports=router;
