const express = require('express')
const app = express()

app.use(express.json())

const persons = [
	{ 
		'id': 1,
		'name': 'Arto Hellas', 
		'number': '040-123456'
	},
	{ 
		'id': 2,
		'name': 'Ada Lovelace', 
		'number': '39-44-5323523'
	},
	{ 
		'id': 3,
		'name': 'Dan Abramov', 
		'number': '12-43-234345'
	},
	{ 
		'id': 4,
		'name': 'Mary Poppendieck', 
		'number': '39-23-6423122'
	}
]

const findPerson = id => {
	return persons.find(person => person.id === id)
}

const personsResourceRoot = '/api/persons'

app.get('/', (request, response) => {
	response.send('<!doctype html><html><body><h1>Nothing in the root</h1></body></html>')
})

app.get(personsResourceRoot, (request, response) => {
	response.json(persons)
})

app.get(`${personsResourceRoot}/:id`, (request, response) => {
	const requestedPersonId = Number(request.params.id)

	if (!requestedPersonId) {
		return response.status(400).json({'error': 'malformed id'})
	}

	const foundPerson = findPerson(requestedPersonId)

	if (!foundPerson) {
		return response.status(404).json({'error': 'could not find person with id ' + requestedPersonId})
	}

	response.json(foundPerson)
})

app.get('/info', (request, response) => {
	response.send(
		`<!doctype html>
		<html>
			<body>
				<p>The phonebook has info for ${persons.length} people.</p>
				<p>${new Date()}</p>
			</body>
		</html>`
	)
})

const PORT = 3001
app.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`)
})