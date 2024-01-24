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

const errorHandler = (error, request, response, next) => {
	console.error(error.message)
	if (error.name === 'CastError') {
		return response.status(400).send({'error': 'malformed ID'})
	}
}

const validatePerson = person => {
	if (!person.hasOwnProperty('name')) {
		return 'cannot create or modify person without name'
	}
	if (!person.hasOwnProperty('number')) {
		return 'cannot create or modify person without number'
	}

	return null
}

const personsResourceRoot = '/api/persons'

app.get('/', (request, response) => {
	response.send('<!doctype html><html><body><h1>Nothing in the root</h1></body></html>')
})

app.get(personsResourceRoot, (request, response, next) => {
	Person.find()
		.then(result => {
			response.json(result)
		})
		.catch(error => {
			next(error)
		})
})

app.get(`${personsResourceRoot}/:id`, (request, response, next) => {
	Person.findById(request.params.id)
		.then(result => {
			response.json(result)
		})
		.catch(error => {
			next(error)
		})
})

app.delete(`${personsResourceRoot}/:id`, (request, response, next) => {
	Person.findByIdAndDelete(request.params.id)
		.then(result => {
			if (result) {
				response.status(204).end()
			}
			else {
				response.status(404).end()
			}
		})
		.catch(error => {
			next(error)
		})
})

app.post(personsResourceRoot, (request, response, next) => {
	const error = validatePerson(request.body)
	if (error) {
		console.error('Person validation error', error)
		return response.status(400).json({'error': error})
	}
	
	Person.find({'name': request.body.name})
		.then(result => {
			if (result.length > 0) {
				const message = `Person with name '${request.body.name}' already exists`
				console.error(message)
				return response.status(400).json({'error': message})
			}
			else {
				const newPerson = new Person({
					'name': request.body.name,
					'number': request.body.number
				})
			
				newPerson.save()
					.then(result => {
						response.json(newPerson)
					})
					.catch(error => {
						next(error)
					})
			}
		})
		.catch(error => {
			next(error)
		})
})

app.put(`${personsResourceRoot}/:id`, (request, response, next) => {
	const error = validatePerson(request.body)
	if (error) {
		console.error('Person validation error', error)
		return response.status(400).json({'error': error})
	}

	const updatedPerson = {
		'name': request.body.name,
		'number': request.body.number
	}
	Person.findByIdAndUpdate(request.params.id, updatedPerson, {'new': true})
		.then(result => {
			if (result) {
				response.json(result)
			}
			else {
				response.status(404).end()
			}
		})
		.catch(error => {
			next(error)
		})
})

app.get('/info', (request, response) => {
	Person.find()
		.then(result => {
			response.send(
				`<!doctype html>
				<html>
					<body>
						<p>The phonebook has info for ${result.length} people.</p>
						<p>${new Date()}</p>
					</body>
				</html>`
			)
		})
		.catch(error => {
			next(error)
		})
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`)
})