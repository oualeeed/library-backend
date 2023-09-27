const typeDefs = `
  type Query {
    allBooks(
      name: String
      genre: String
    ): [Book!]!
  }

  type Mutation {
    addBook (
      title: String!
      published: Int!
      genres: [String!]!
    ): Book
  }
  
  type Book {
    title: String!
    published: Int!
    id: ID!
    genres: [String]!
  }
` 

module.exports = typeDefs
