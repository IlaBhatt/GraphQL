//using graphql-request package to reduce writing the boiler plate code
//to fetch the data from graphql API
import { GraphQLClient } from "graphql-request";
import { getAccessToken } from "../auth";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

//setting up authentication on client side
const client = new GraphQLClient("http://localhost:9000/graphql", {
  headers: () => {
    const accessToken = getAccessToken();
    if (accessToken) {
      return { Authorization: `Bearer ${accessToken}` };
    }
    return {};
  },
});

const apolloClient = new ApolloClient({
  url: "http://localhost:9000/graphql",
  cache: new InMemoryCache(),
});
export async function createJob({ title, description }) {
  const mutation = gql`
    mutation CreateJob($input: CreateJobInput!) {
      job: createJob(input: $input) {
        id
      }
    }
  `;
  const { job } = await client.request(mutation, {
    input: { title, description },
  });
  //here alias job created comes handy
  return job;
}

export async function getCompany(id) {
  const query = gql`
    query CompanyById($id: ID!) {
      company(id: $id) {
        id
        name
        description
        jobs {
          id
          title
          description
          date
        }
      }
    }
  `;
  //request method returns a promise
  const { company } = await client.request(query, { id });
  return company;
}

export async function getJob(id) {
  const query = gql`
    query JobById($id: ID!) {
      job(id: $id) {
        id
        date
        title
        description
        company {
          id
          name
        }
      }
    }
  `;
  const { job } = await client.request(query, { id });
  console.log(job);
  return job;
}

export async function getJobs() {
  const query = gql`
    query {
      jobs {
        title
        id
        date
        company {
          id
          name
        }
      }
    }
  `;
  // const { jobs } = await client.request(query);
  //replacing graphql-request client with the apolloclient
  const {data} = await apolloClient.query({ query });
  return data.jobs;
}

function isObjectEmpty(obj) {
  return (
    !!obj && // 👈 null and undefined check
    Object.keys(obj).length === 0 &&
    obj.constructor === Object
  );
}
