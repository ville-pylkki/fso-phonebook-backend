require('dotenv').config()

const cors = require('cors')
const express = require('express')
const morgan = require('morgan')

const Person = require('./models/person')

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
app.use(express.static('dist'))
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
	Person.find()
		.then(result => {
			response.json(result)
		})
})

app.get(`${personsResourceRoot}/:id`, (request, response) => {
	Person.findById(request.params.id)
		.then(result => {
			response.json(result)
		})
})

app.delete(`${personsResourceRoot}/:id`, (request, response) => {
	Person.findByIdAndDelete(request.params.id)
		.then(result => {
			response.status(204).end()
		})
		.catch(error => {
			console.error(`Deleting person with ID ${request.params.id} failed`, error)
		})
})

app.post(personsResourceRoot, (request, response) => {
	const error = validatePerson(request.body)
	if (error) {
		return response.status(400).json({'error': error})
	}

	const newPerson = new Person({
		'name': request.body.name,
		'number': request.body.number
	})

	newPerson.save()
		.then(result => {
			response.json(newPerson)
		})
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

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`)
})