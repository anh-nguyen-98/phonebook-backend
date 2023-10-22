require('dotenv').config()
const mongoose = require('mongoose')



const url = process.env.MONGODB_URI
console.log('connecting to', url)

mongoose.set('strictQuery',false)
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })


const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

// arguments length
if (process.argv.length === 2) {
  // display all entries
  Person
    .find({})
    .then (persons => {
      console.log('phonebook:')
      persons.forEach(p => {
        console.log(`${p.name} ${p.number}`)
      })
      mongoose.connection.close()
    })

}
else if (process.argv.length === 5) {
  // add new entry
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })
  person.save().then(result => {
    console.log(`added ${result.name} number ${result.number} to phonebook`)

  })

}


// const noteSchema = new mongoose.Schema({
//   content: String,
//   important: Boolean,
// })

// const Note = mongoose.model('Note', noteSchema)

// const note = new Note({
//   content: 'HTML is Easy',
//   important: true,
// })

// note.save().then(result => {
//   console.log('note saved!')
//   mongoose.connection.close()
// })