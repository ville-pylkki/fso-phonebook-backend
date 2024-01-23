const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const dbUrl = process.env.DB_URI

console.info('Connnecting to database', dbUrl)
mongoose.connect(dbUrl)
	.then(() => {
		console.info('Database connection succesful')
	})
	.catch(error => {
		console.error('Database connection failed', error)
	})

const personSchema = new mongoose.Schema({
	name: String,
	number: String
})

module.exports = mongoose.model('Person', personSchema)