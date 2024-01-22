const mongoose = require('mongoose')

const printHelpMessage = () => {
	console.info('Application usage: node mongo.js [database-password] [new-person-name] [new-person-number]')
}

if (process.argv.length < 3) {
	printHelpMessage()
	process.exit(1)
}

const dbPassword = process.argv[2]
const dbUrl = `mongodb+srv://fso:${dbPassword}@cluster0.7pm51o5.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(dbUrl, {'dbName': 'fso-phonebook'}).then(() => {
	console.log('Database connection succesful')
}).catch(error => {
	console.log('Database connection failed', error)
})

const personSchema = new mongoose.Schema({
	name: String,
	number: String
})
const Person = mongoose.model('Person', personSchema)

const fetchAllPersons = () => {
	console.debug('Fetching all persons')

	console.info('Phonebook:')
	Person.find({}).then(result => {
		result.forEach(person => {
			console.info(`${person.name} ${person.number}`)
		})

		mongoose.connection.close()
	})
}

const savePerson = (name, number) => {
	console.debug('Saving person')

	const newPerson = new Person({
		'name': name,
		'number': number
	})
	newPerson.save().then(result => {
		console.debug('Person saved', result)
		console.info(`Added ${result.name} ${result.number} to phonebook`)
		mongoose.connection.close()
	})
}

if (process.argv.length === 3) {
	fetchAllPersons()
}
else if (process.argv.length === 5) {
	savePerson(process.argv[3], process.argv[4])
}
else {
	printHelpMessage()
	mongoose.connection.close()
}