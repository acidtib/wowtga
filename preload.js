// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { remote } = require('electron');
const app = remote.app;
const db = require('electron-db');

// create initial clean database
db.createTable('settings', (succ, result) => {
  if (succ) {
    console.log(result)

    let obj = new Object()
    obj.name = "wow_directory"
    obj.value = ""

    db.insertTableContent('settings', obj, (succ, msg) => {
      console.log(succ);
    })
  }
})

db.createTable('screenshots', (succ, result) => {
  if (succ) {
    console.log(result)
  }
})