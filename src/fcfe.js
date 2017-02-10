
const ENV = {
  DOMAIN: null,
};

Object.keys(ENV).forEach(function(key) {
  if (process.env[key]) {
    ENV[key] = process.env[key];
  }
  if (!ENV[key]) {
    throw new Error(`Missing required environment variable ${key}`);
  }
});
