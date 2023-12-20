const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.static('dist'))
app.use(express.json());

morgan.token('body', (req, res) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body);
    } else {
        return ' ';
    }
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
];

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find(person => person.id === id);
    if (person) {
        response.json(person);
    } else {
        response.status(404).end();
    }
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(`Phonebook has info for ${persons.length} people<br/>${new Date()}`);
})

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.post('/api/persons', (request, response) => {
    
    const obj = { ...request.body, id: Math.floor(Math.random() * 10000) };
    if (!obj.name) {
        response.status(400).send('Name is missing');
    } else if (!obj.number) {
        response.status(400).send('Number is missing');
    } else {
        const personsNames = persons.map(person => person.name.toLowerCase());
        if (personsNames.includes(obj.name.toLowerCase())) {
            response.status(400).send('Name must be unique');
        } else {
            persons = persons.concat(obj);
            response.json(obj);
        }
    }
});

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id);
    response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});