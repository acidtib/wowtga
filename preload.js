// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { remote } = require('electron');
const app = remote.app;
const db = require('electron-db');

// create initial clean database
db.createTable('screenshots', (succ, result) => {
  if (succ) {
    console.log(result)
  } else {
    console.log(result)
  }
})