const express = require('express')
const multer = require('multer')
const request = require('request')
const fs = require('fs')
const redis = require('redis')

const app = express()
const disk = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload = multer({storage:disk})
const client = redis.createClient()

const URL = 'http://localhost:4212'

app.get('/add',(req,res) => {
	res.sendFile(__dirname + '/add.html')
})

app.post('/add',upload.single('file'),(req,res,next) => {
	client.get('images',(err,body) => {
		if (err) throw err
		
		let uId = 1
		let rows = []

		if(body != null) {
			rows = JSON.parse(body)
			uId = rows.length + 1 
			rows.push({id:uId,src:req.file.path})
			console.log(rows)
		} else {
			rows = [{id:uId,src:req.file.path}]
		}

		client.set('images',JSON.stringify(rows),(err,resp) => {
			fs.createReadStream(req.file.path).pipe(request.put(URL + '/index/images/' + uId,(err,resp,body) => {
				if (err) next(err)
				body = JSON.parse(body)
				res.json(body)
				next()	
			}))
		})

	})
	
})

app.get('/search',(req,res) => {
	res.sendFile(__dirname + '/form.html')
})

app.post('/search',upload.single('file'),(req,res,next) => {
	
	fs.createReadStream(req.file.path).pipe(request.post(URL + '/index/searcher' ,(err,resp,body) => {
		if (err) next(err)
		body = JSON.parse(body)

		if(body.image_ids.length > 0) {
			client.get('images',(panic,responseData) => {
				if (panic) throw panic
				if (responseData != null) {
					responseData = JSON.parse(responseData)
					let results = responseData.filter((v) => {
						return body.image_ids.indexOf(v.id) != -1
					})

					res.json(results)
				}	

				next()
			})
		} else {
			res.json({result:"Blas..."})
			next()
		}

	}))
	
})

app.listen(8000,() => console.log('localhost:8000'))
