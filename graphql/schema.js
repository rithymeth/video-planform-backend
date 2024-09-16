const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
} = require("graphql");
const { getUser, getVideo } = require("../controllers/graphqlController"); // Correct path to graphqlController.js

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLString },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
  },
});

const VideoType = new GraphQLObjectType({
  name: "Video",
  fields: {
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
  },
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        return getUser(args.id);
      },
    },
    videos: {
      type: new GraphQLList(VideoType),
      resolve(parent, args) {
        return getVideo();
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
});

module.exports = { schema };
