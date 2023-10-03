const typeDefs = `
  type Query {
    allBooks(
      name: String
      genre: String
    ): [Book!]!
    bookCount: Int!
    allAuthors: [Author!]!
    authorCount: Int
  }

  type Mutation {
    addBook (
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book
    editAuthor (
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
      password: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
  
  type Book {
    title: String!
    published: Int!
    id: ID!
    author: Author!
    genres: [String]!
  }

  type Author {
    name: String!
    id: ID!
    born: String
    bookCount: Int
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }
`;

module.exports = typeDefs;
