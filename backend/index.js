const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

const unknownEndpoint = (request, response) => {
    response.status(404).send({
        error: "unknown endpoint"
    })
}

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
morgan.token('req-body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

let persons = 
[
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
]

// 请求所有对象
app.get('/api/persons',(request, response) => {
    return response.json(persons)
})

// 请求单个对象
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    return person ? response.json(person) : response.status(404).send()
})

// 其他请求
app.get('/info', (request, response) => {
    return response.send(
        `
        <p>
            Phonebook has info for ${persons.length} people
            <br/> 
            ${new Date()}
        </p>
        `
    )
})

// 删除一个对象
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    persons = persons.filter(person => person.id != id)

    return response.status(204).send()
})

const generated = () => {
    const getNumber = () =>{
        const number = Math.floor(Math.random() * 10)
        return persons.map(person => person.id).find(v => v === number)
            ? getNumber()
            : number
    }
    const maxId = persons.length > 0
        ? getNumber()
        : 0
    
    return maxId + 1;
}

// 添加一个对象
app.post('/api/persons', (request, response) => {
    const body = request.body
    const person = {
        id: generated(),
        name: body.name,
        number: body.number
    }

    if(!!persons.find(person => person.name === body.name)){
        return response.status(404).send({
            error: "The name already exists in the phonebook."
        })
    }

    if(!body.name || !body.number){
        return response.status(404).send({
            error: "The name or number is missing."
        })
    }

    persons = persons.concat(person)
    return response.send({
        sucess: `Added ${body.name}`
    })
})

app.use(unknownEndpoint)

app.listen(process.env.PORT || 3001, () => {
    console.log(`Server is running on http://localhost:3001/`)
})
