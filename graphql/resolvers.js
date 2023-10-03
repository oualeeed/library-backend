const Author = require('../model/author')
const Book = require('../model/book')

const resolvers = {
  Query: {
    allBooks: async (root, args) => {
      let books = await Book.find({}).populate('author')

      if (args.name) {
        books = books.filter(book => book.author.name === args.name)
      }

      if (args.genre) {
        books = books.filter(book => book.genres.includes(args.genre))
      }

      return books
    },
    bookCount: async (root, args) => {
      return Book.collection.countDocuments()
    },
    allAuthors: async (root, args) => {
      return Author.find({})
    },
    authorCount: async (root, args) => {
      return Author.collection.countDocuments()
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      const {title, published, genres} = args
      const authors =  await Author.find({})
      const authorExist = authors.find(author => author.name === args.author)

      if (authorExist) {
        const book = new Book({
          title,
          published,
          genres,
          author: authorExist._id.toString()
        })

        try {
          await book.save()
        } catch (error) {
          throw new GraphQLError('Saving the book failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              error
            }
          })
        }
        return Book.findById(book._id.toString()).populate('author')
      }
      
      const newAuthor = new Author({
        name: args.author,
      })

      try {
        await newAuthor.save()
      } catch (error) {
        throw new GraphQLError('Saving the author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            error
          }
        })
      }
      const book = new Book({
        title,
        published,
        genres,
        author: newAuthor._id.toString()
      })
      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError('Saving the book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            error
          }
        })
      }
      return Book.findById(book._id.toString()).populate('author')
    },
    editAuthor: async (root, args) => Author.findOneAndUpdate(
      { name: args.name }, 
      { 
        name: args.name, 
        born: args.setBornTo 
      },
      { new: true },
    )
  },
  Author: {
    bookCount: async (root, args) => {
      const books = await Book.find({}).populate('author')
      console.log(books)
      return books
        .map(book => book.author)
        .filter(author => author.name === root.name)
        .reduce((a, c) => a+1, 0)
    }
  }
}

module.exports = resolvers
