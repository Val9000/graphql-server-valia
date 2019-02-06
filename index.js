const express = require('express')
const jwt = require("express-jwt")
const jsonwebtoken = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const mongoose = require('mongoose')
const { User } = require('./models/User.js')
const { ApolloServer, gql } = require('apollo-server-express')

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type User {
    id: Int
    username: String!
    email: String!
    password: String!
  }
  type Query {
    me: User
  }
  type Mutation {
    signup (username: String!, email: String!, password: String!): String
    login (email: String!, password: String!): String
  }

`;



// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    me: () => 'Hello world!',
  },
  Mutation: {
    async signup(_, { username, email, password }) {
      let user = new User({
        username,
        email,
        password: await bcrypt.hash(password, 10)
      });
      await user.save((err) => {
        if (err) {
          console.error(err);
          // apollo error.
        }
      });

      // Return json web token
      return jsonwebtoken.sign(
        { id: user.id, email: user.email },
        "process.env.JWT_SECRET",
        { expiresIn: '1y' }
      );
    },

    async login(_, { email, password }) {
      const user = await User.findOne({ email: email })

      if (!user) {
        throw new Error('No user with that email')
      }

      const valid = await bcrypt.compare(password, user.password)

      if (!valid) {
        throw new Error('Incorrect password')
      }

      // Return json web token
      return jsonwebtoken.sign(
        { id: user.id, email: user.email },
        "process.env.JWT_SECRET",
        { expiresIn: '1y' }
      )
    }


  }
};


mongoose.connect('mongodb://valon:valon123@ds125331.mlab.com:25331/caradmindb');

const server = new ApolloServer({ typeDefs, resolvers });

// auth middleware
const auth = jwt({
  secret: "process.env.JWT_SECRET",
  credentialsRequired: false
});

const app = express();
app.use(auth);

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);