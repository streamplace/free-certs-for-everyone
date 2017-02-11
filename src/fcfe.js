
import express from "express";
import {resolve} from "path";
import morgan from "morgan";
import greenlock from "greenlock";
import standaloneChallenge from "le-challenge-standalone";
import leStoreCertbot from "le-store-certbot";
import fs from "fs-promise";

const challenge = standaloneChallenge.create({
  debug: true
});

const le = greenlock.create({
  server: 'staging',
  challenges: {
    "http-01": challenge,
  },
});
const app = express();

app.use(morgan("combined"));
app.use(le.middleware());

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

const inProgress = {};
app.get("/:subdomain", function(req, res) {
  if (inProgress[subdomain] === true) {
    return res.status(409).end("This cert is already being issued.");
  }
  inProgress[subdomain] = true;
  const configDir = `/tmp/${Math.round(Math.random() * 10000000000)}`;
  const le = greenlock.create({
    server: 'staging',
    store: leStoreCertbot.create({configDir}),
    challenges: {
      "http-01": challenge,
    },
  });
  const subdomain = `${req.params.subdomain}.${ENV.DOMAIN}`;
  le.register({
    domains: [subdomain],
    email: "eli+domains@stream.place",
    agreeTos: true,
  })
  .then(({privkey, cert, chain, subject, altnames, issuedAt, expiresAt}) => {
    res.json({privkey, cert, chain, subject, altnames, issuedAt, expiresAt});
    return fs.remove(configDir);
  })
  .then((...args) => {
    inProgress[subdomain] = false;
  })
  .catch((err) => {
    inProgress[subdomain] = false;
    console.error(err);
    res.sendStatus(500);
  });
});

app.listen(ENV.PORT);
console.log(`FCFE listening on port ${ENV.PORT}`);
