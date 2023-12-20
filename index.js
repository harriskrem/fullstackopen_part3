require('dotenv').config();
const express = require('express');
const Contact = require('./models/Contact');
const app = express();


const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(express.static('dist'))
app.use(express.json());
app.use(requestLogger);

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    Contact.find({}).then((persons) => response.json(persons))
})

app.get('/api/persons/:id', (request, response, next) => {
    Contact.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch(error => next(error))
})

app.get('/info', (request, response) => {
    Contact.find({}).then(persons => {
        console.log(persons)
        response.send(`Phonebook has info for ${persons.length} people<br/>${new Date()}`)
    })
})

app.post('/api/persons', (request, response, next) => {
    const obj = { ...request.body };
    if (!obj.name) {
        response.status(400).json({ error: 'Name is missing' });
    } else if (!obj.number) {
        response.status(400).json({ error: 'Number is missing' });
    } else {
        new Contact({
            name: obj.name,
            number: obj.number
        }).save()
            .then(res => {
                response.json(res);
            })
            .catch(error => next(error))
    }
});

app.put('/api/persons/:id', (request, response, next) => {
    Contact.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true, context: 'query' })
        .then(updatedNote => {
            response.json(updatedNote);
        })
        .catch(error => next(error));
})

app.delete('/api/persons/:id', (request, response, next) => {
    Contact.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end();
        })
        .catch(error => next(error));
    response.status(204).end();
});

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});