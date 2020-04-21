const { gql } = require("apollo-server-express");
const { fromGlobalId, toGlobalId } = require("graphql-relay");
const { GraphQLDateTime } = require("graphql-iso-date");
const fetch = require("node-fetch");

const typeDefs = gql`
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type Training {
    id: ID!
    title: String!
    objectives: String!
    curriculum: String!
    overview: String
    startDate: DateTime
    discounts: DiscountConnection
  }

  type TrainingEdge {
    # https://relay.dev/graphql/connections.htm#sec-Node
    node: Training
    # https://relay.dev/graphql/connections.htm#sec-Cursor
    cursor: String!
  }

  type TrainingConnection {
    # https://relay.dev/graphql/connections.htm#sec-Connection-Types.Fields.PageInfo
    pageInfo: PageInfo!
    # https://relay.dev/graphql/connections.htm#sec-Edges
    edges: [TrainingEdge]
    # total count is not part of GraphQL Cursor Connection Spec, but we can extend the spec
    totalCount: Int
  }

  type DiscountConnection {
    edges: [DiscountEdge]
    pageInfo: PageInfo!
    totalCount: Int
  }

  type DiscountEdge {
    node: Discount
    cursor: String!
  }

  type Discount {
    id: ID!
    code: String!
    discountPercentage: Int!
    description: String
    expiresOn: DateTime
  }

  # 🚧 You must use this input
   input DiscountFilter {
        trainingId : ID!
   }

  enum OrderDirection {
    # Specifies an ascending order for a given orderBy argument.
    ASC
    # Specifies a descending order for a given orderBy argument.
    DESC
  }

  enum DiscountOrderField {
    expiresOn
    discountPercentage
    code
  }

  input DiscountOrder {
    field: DiscountOrderField # 🚧 this field should not be a String, add the right type.
    direction: OrderDirection # 🚧 this field should not be a String, add the right type.
  }

  scalar DateTime

  type Query {
    trainings(
      after: String
      first: Int
      before: String
      last: Int
    ): TrainingConnection

    training(id: ID!): Training

    discounts(
      after: String
      first: Int
      before: String
      last: Int
      filter: DiscountFilter
      orderBy: DiscountOrder
    ): DiscountConnection
    discount(id: ID!): Discount
  }
`;

const resolvers = {
  Query: {
    trainings: (_, args, { services }) => services.findTrainings(args),
    training: (_, { id }, { services }) => services.findTrainingById(id),

    discounts: (_, args, { services }) => services.findDiscounts(args),

    discount: (_, { id }, { services }) => services.findDiscountById(id),
  },
  DateTime: GraphQLDateTime,
  OrderDirection: {
    DESC: -1,
    ASC: 1
  },
  Training: {
    discounts: (parent, args, { services }) => services.findDiscountsByTrainingId(args, parent._id)
  }
};

module.exports = { typeDefs, resolvers };
