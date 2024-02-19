import {
  getJobs,
  getJob,
  getJobsByCompany,
  createJob,
  deleteJob,
  updateJob,
} from "./db/jobs.js";
import { getCompany } from "./db/companies.js";
import { GraphQLError } from "graphql";
export const resolvers = {
  Query: {
    jobs: async () => getJobs(),
    job: async (_root, { id }) => {
      const job = await getJob(id);
      if (!job) {
        throw notFoundError("No job found with id: " + id);
      }
      return job;
    },
    company: async (_root, { id }) => {
      const company = await getCompany(id);
      if (!company) {
        throw notFoundError("No company found with id: " + id);
      }
      return company;
    },
  },
  Job: {
    company: (job) => {
      return getCompany(job.companyId);
    },
    date: (job) => toIsoDate(job.createdAt),
  },
  Company: {
    jobs: (company) => getJobsByCompany(company.id),
  },
  Mutation: {
    createJob: (__root, { input: { title, description } }, { user }) => {
      console.log(user);
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }
      // const companyId = "FjcJCHJALA4i"; //TODO change later based on user
      // return null;
      return createJob({ companyId: user.companyId, title, description });
    },
    deleteJob: async(__root, { id }, {user}) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }
      const job = await deleteJob(id, user.companyId);
      // return deleteJob(id);
      if(!job){
        throw notFoundError("Job not found");
      }
      return job;
    },
    updateJob: async(__root, { input: { id, title, description } }, { user }) => {
      if(!user){
        throw unauthorizedError("Missing authentication");
      }
      const job = await updateJob({ id, companyId:user.companyId, title, description });
      if(!job){
        throw notFoundError("Job not found!");
      }
      return job;
    },
    // uodateJob: ( __root, { input: {title, description }}) => {
    //   const companyId='FjcJCHJALA4i'; //TODO change later based on user
    //   return createJob({companyId, title, description});
    // },
  },
};

function unauthorizedError(message) {
  return new GraphQLError(message, {
    extensions: { code: "UNAUTHORIZED" },
  });
}

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: { code: "NOT_FOUND" },
  });
}
function toIsoDate(value) {
  return value.slice(0, "yyyy-mm-dd".length);
}
