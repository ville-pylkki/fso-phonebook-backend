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

const numberValidator = input => {
	console.debug('Validating phonenumber', input)

	return /^[\d]{2,3}-\d+$/.test(input)
}

const personSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: 3,
		required: true
	},
	number: {
		type: String,
		minLength: 8,
		validate: {
			validator: numberValidator,
			message: props => {
				return `Phone number ${props.value} is not valid`
			}
		},
		required: true
	}
})

personSchema.set('toJSON', {
	'transform': (document, transformed) => {
		transformed.id = transformed._id.toString()
		delete transformed._id
		delete transformed.__v
	}
})

module.exports = mongoose.model('Person', personSchema)