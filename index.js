const cors = require('cors')
const express = require('express')
const morgan = require('morgan')

const assignPostContent = (request, response, next) => {
	if (request.method === 'POST') {
		request.postContent = JSON.stringify(request.body)
	}
	else {
		request.postContent = ''
	}

	next()
}

morgan.token('post-content', request => {
	return request.postContent
})

const app = express()

app.use(express.json())
app.use(assignPostContent)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-content'))
app.use(cors())

let persons = [
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

const deletePerson = id => {
	persons = persons.filter(person => person.id !== id)
}

const findPerson = id => {
	return persons.find(person => person.id === id)
}

const findPersonByName = name => {
	return persons.find(person => person.name.toLowerCase() === name.toLowerCase())
}

const generateNewId = () => {
	let newId
	let isUniqueId = false
	do {
		newId = Math.floor(Math.random() * 999 + 1)
		if (!findPerson(newId)) {
			isUniqueId = true
		}
	} while (!isUniqueId)

	return newId
}

const validatePerson = person => {
	if (!person.hasOwnProperty('name')) {
		return 'cannot create person without name'
	}
	if (!person.hasOwnProperty('number')) {
		return 'cannot create person without number'
	}
	if (findPersonByName(person.name)) {
		return `person with name '${person.name}' already exists` 
	}

	return null
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

app.delete(`${personsResourceRoot}/:id`, (request, response) => {
	const requestedPersonId = Number(request.params.id)

	if (!requestedPersonId) {
		return response.status(400).json({'error': 'malformed id'})
	}

	if (!findPerson(requestedPersonId)) {
		return response.status(404).json({'error': 'could not find person with id ' + requestedPersonId})
	}

	deletePerson(requestedPersonId)

	response.status(204).end()
})

app.post(personsResourceRoot, (request, response) => {
	const newPerson = request.body

	const error = validatePerson(newPerson)
	if (error) {
		return response.status(400).json({'error': error})
	}

	newPerson.id = generateNewId()

	persons = persons.concat(newPerson)

	response.json(newPerson)
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