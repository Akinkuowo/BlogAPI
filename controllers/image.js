const Clarifai =  require('clarifai'); 

const app = new Clarifai.App({
	apiKey: 'b58ede7aa631416bae3171439897588c'
});

const handleApiRequest = (req, res) => {
	app.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
	.then(data => {
		res.json(data)
	}).catch(err => res.status(400).json('Unable to fetch Api'))
}

const handleImage = (req, res, db) => {
	const { id } = req.body
		db('users').where('id', '=', id).increment('entries', 1).returning('entries').then(response => {
			res.json(response[0]);
	}).catch(err => res.status(400).json('entries not found'))

}

module.exports = {
	handleImage: handleImage,
	handleApiRequest: handleApiRequest
}