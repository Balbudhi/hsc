const path = require('path');

module.exports = {
  entry: './public/src/index.js', // Update the entry point to match your actual entry file location
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'main.js',
  },
  // Other webpack configuration options...
};
