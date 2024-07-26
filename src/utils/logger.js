// logger.js
const isProduction = process.env.NODE_ENV === 'production';

const consoleMethods = ['log', 'warn', 'error', 'info', 'debug'];

consoleMethods.forEach(method => {
  const originalMethod = console[method];
  console[method] = (...args) => {
    if (!isProduction) {
      originalMethod(...args);
    }
  };
});
