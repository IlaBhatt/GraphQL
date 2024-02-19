import { ApolloServer } from "@apollo/server";
import cors from "cors";
import express from "express";
import { authMiddleware, handleLogin } from "./auth.js";
import { readFile } from "node:fs/promises";
import { expressMiddleware as apolloMiddleware } from "@apollo/server/express4";
import { resolvers } from "./resolvers.js";
import { getUser } from "./db/users.js";
const PORT = 9000;

const app = express();
app.use(cors(), express.json(), authMiddleware);

app.post("/login", handleLogin);

//this will read the content of schema of the file and assign as string to typeDef variable
const typeDefs = await readFile("./schema.graphql", "utf8");

//req oject gives us all the details of http request
async function getContext({ req }) {
  // console.log("auth request", req.auth);
  if(req.auth){
    const user = await getUser(req.auth.sub);
    return { user };
  }
  return {};
}
const apolloServer = new ApolloServer({ typeDefs, resolvers });
await apolloServer.start();
//integrate apolloServer in express application
app.use("/graphql", apolloMiddleware(apolloServer, { context: getContext }));
app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Graphql endpoint: http://localhost:${PORT}/graphql`);
});
