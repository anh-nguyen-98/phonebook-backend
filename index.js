require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Person = require('./models/person');

const app = express();
app.use(express.static('dist'));
app.use(cors());
app.use(express.json());

morgan.token('data', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.get('/', (request, response) => {
    response.send('Hello World!');
})
app.get('/info', (request, response) => {
    const date = new Date();
    response.send(`<p>Phonebook has info for ${Person.length} people</p><p>${date}</p>`)
})
app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then(persons => {
            response.json(persons);
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (!person) {
                response.status(404).end();
            }
            response.json(person);
        })
        .catch(error =>  next(error))
})
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const person = request.body
    if (!person.name || !person.number) {
        return response.status(400).json({
            error: 'name and number must not be empty'
        })
    }
    Person.findOne({name: person.name})
        .then(result => {
            if (result) {
                Person.findByIdAndUpdate(request.params.id, person, {new: true})
                .then (updatedPerson => {
                    response.json(updatedPerson)
                })
                .catch(error => next(error))
            } else {
                const newPerson = new Person({
                    name: person.name,
                    number: person.number
                })
                newPerson.save()
                    .then(savedPerson => {
                        response.json(savedPerson)
                    })
                    .catch(error => next(error))

            }
        })
})

app.put('/api/persons/:id', (request, response) => {
    const person = request.body
    Person.findByIdAndUpdate(request.params.id, person, {new: true, runValidators: true, context: 'query'})
        .then (updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint);

const errorHandler = (error, requuest, response, next) => {
    console.log(error.message);
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }
    next(error);
}
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})