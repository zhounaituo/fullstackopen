const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

const Person = require('./models/node')

const unknownEndpoint = (request, response) => {
    response.status(404).send({
        error: "unknown endpoint"
    })
}

const errorHandler = (error, request, response, next) => {
    console.log(error)

    if(error.name === 'CastError'){
        return response.status(400).send({ error: 'malformatted id.'})
    }

    next(error)
}

morgan.token('req-body', req => JSON.stringify(req.body))

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

// 请求所有对象
app.get('/api/persons',(request, response) => {
    Person.find({}).then(result => {
        response.json(result)
    })
})

// 请求单个对象
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person){
                response.json(person)
            } else {
                response.status(404).send({ error: `${request.params.id} is not fund.`})
            }
        })
        .catch(error => next(error))
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
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            if(result){
                response.status(200).send(result)
            } else {
                response.status(404).send({ error: `${request.params.id} is not fund.`})
            }
        })
        .catch(error => next(error))
})

// 添加一个对象
app.post('/api/persons', (request, response, next) => {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number
    }

    if(!body.name || !body.number){
        return response.status(404).send({
            error: "The name or number is missing."
        })
    }

    Person.find({ name: person.name})
        .then(result => {
            if(result.length > 0){
                Person.findByIdAndUpdate(result[0]._id.toString(), person, {new: true})
                    .then(result => {
                        return response.send({
                            sucess: `Updated ${result}`
                        })
                    })
            } else {
                Person.insertMany(person)
                    .then(result => {
                        return response.send({
                            sucess: `Added ${result[0].name}`
                        })
                    })
            }
        })
        .catch(error => next(error))


})

app.use(unknownEndpoint)
app.use(errorHandler)

app.listen(process.env.PORT || 3001, () => {
    console.log(`Server is running on http://localhost:3001/`)
})