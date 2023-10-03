const Author = require("../model/author");
const Book = require("../model/book");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");

const resolvers = {
  Query: {
    allBooks: async (root, args) => {
      let books = await Book.find({}).populate("author");

      if (args.name) {
        books = books.filter((book) => book.author.name === args.name);
      }

      if (args.genre) {
        books = books.filter((book) => book.genres.includes(args.genre));
      }

      return books;
    },
    bookCount: async (root, args) => {
      return Book.collection.countDocuments();
    },
    allAuthors: async (root, args) => {
      return Author.find({});
    },
    authorCount: async (root, args) => {
      return Author.collection.countDocuments();
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      const { title, published, genres } = args;
      const authors = await Author.find({});
      const authorExist = authors.find((author) => author.name === args.author);

      if (authorExist) {
        const book = new Book({
          title,
          published,
          genres,
          author: authorExist._id.toString(),
        });

        try {
          await book.save();
        } catch (error) {
          throw new GraphQLError("Saving the book failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              error,
            },
          });
        }
        return Book.findById(book._id.toString()).populate("author");
      }

      const newAuthor = new Author({
        name: args.author,
      });

      try {
        await newAuthor.save();
      } catch (error) {
        throw new GraphQLError("Saving the author failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            error,
          },
        });
      }
      const book = new Book({
        title,
        published,
        genres,
        author: newAuthor._id.toString(),
      });
      try {
        await book.save();
      } catch (error) {
        throw new GraphQLError("Saving the book failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            error,
          },
        });
      }
      return Book.findById(book._id.toString()).populate("author");
    },
    editAuthor: async (root, args) =>
      Author.findOneAndUpdate(
        { name: args.name },
        {
          name: args.name,
          born: args.setBornTo,
        },
        { new: true },
      ),
    createUser: async (root, args) => {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(args.password, saltRounds);
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
        passwordHash,
      });

      let addedUser;
      try {
        addedUser = await user.save();
      } catch (error) {
        throw new GraphQLError("Create user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            error,
          },
        });
      }

      return addedUser;
    },
    login: async (root, args) => {
      const user = await User.findOne({
        username: args.username,
      });

      if (!user)
        throw new GraphQLError("wrong username", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });

      const correctPassword = await bcrypt.compare(
        args.password,
        user.passwordHash,
      );
      if (!correctPassword)
        throw new GraphQLError("Login failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.password,
            error,
          },
        });

      const userForToken = {
        username: user.username,
        id: user._id.toString(),
        favoriteGenre: user.favoriteGenre,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
  Author: {
    bookCount: async (root, args) => {
      const books = await Book.find({}).populate("author");
      return books
        .map((book) => book.author)
        .filter((author) => author.name === root.name)
        .reduce((a, c) => a + 1, 0);
    },
  },
};

module.exports = resolvers;
