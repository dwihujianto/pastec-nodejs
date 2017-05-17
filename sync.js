const redis = require('redis')
const client = redis.createClient()
const fs = require('fs')
const path = require('path')
const request = require('request')

const URL = 'http://localhost:4212'

client.get('images',(err,body) => {
	if (err) throw err
		
	if(body != null) {
		const rows = JSON.parse(body)
		sync(rows,0)
	}
})


const sync = (data,index) => {
	if (index < data.length) {
		fs.createReadStream(path.join(__dirname,data[index].src)).pipe(request.put(URL + '/index/images/' + data[index].id,(err,resp,body) => {
			if (err) throw err
			console.log(body)
			sync(data,index+1)
		}))
	} else {
		console.info('done')
	}

}