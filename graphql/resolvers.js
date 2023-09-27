const Book = require('../model/book')

const resolvers = {
  Query: {
    allBooks: async (root, args) => {
      return Book.find({})
    },
  },
  Mutation: {
    addBook: async (root, args) => {

      const book = new Book({
        ...args
      })

      return book.save()
    },
  }
}

module.exports = resolvers