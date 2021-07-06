'use strict';

require('dotenv').config();

const PORT = +process.env.PORT || 3001;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return process.env.NODE_ENV === 'test'
    ? 'shuffle_test'
    : process.env.DATABASE_URL || 'shuffle_db';
}

console.log('shuffle_db config:');
console.log('Database:', getDatabaseUri());
console.log('---');

module.exports = {
  getDatabaseUri,
  PORT,
};
