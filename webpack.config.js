const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'managers.js',
    path: path.resolve(__dirname, 'dist'),
  },
};