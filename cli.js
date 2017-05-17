const fs = require('fs')
const request = require('request')
const URL = 'http://localhost:4212'

const file = process.argv[3]

if(process.argv[2] == 'ping') {
	const opt = {
		url:URL, 
		method:"POST",
		data:{
			type:"PING"
		}
	}

	request(opt,(err,resp,body) => {
		if (err) throw err
		console.info(body)
	})
}

if(process.argv[2] == 'add') {
	const id = process.argv[4]
	if (id == '' || id == undefined) throw new Error('Id ne required bro')

	fs.createReadStream(file).pipe(request.put(URL + '/index/images/' + id),(err,resp,body) => {
		if (err) throw err

		console.info(body)	
	})
}

if(process.argv[2] == 'find') {
	fs.createReadStream(file).pipe(request.post(URL + '/index/searcher' ,(err,resp,body) => {
		if (err) throw err

		console.info(body)
	}))
}
