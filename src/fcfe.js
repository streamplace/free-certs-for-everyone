
import express from "express";
import {resolve} from "path";

const app = express();

const ENV = {
  DOMAIN: null,
  PORT: 80,
};

Object.keys(ENV).forEach(function(key) {
  if (process.env[key]) {
    ENV[key] = process.env[key];
  }
  if (!ENV[key]) {
    throw new Error(`Missing required environment variable ${key}`);
  }
});

app.use(express.static(resolve(__dirname, "static")));

app.listen(ENV.PORT);
console.log(`FCFE listening on port ${ENV.PORT}`);
