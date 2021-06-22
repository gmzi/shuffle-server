'use strict';

require('dotenv').config();

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return process.env.NODE_ENV === 'test'
    ? 'shuffler_test'
    : process.env.DATABASE_URL || 'shuffler';
}

console.log('shuffler config:');
console.log('Database:', getDatabaseUri());
console.log('---');

module.exports = {
  getDatabaseUri,
};
