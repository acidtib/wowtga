// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

delete module.exports
const fs = require('fs')
const { remote } = require('electron')
const app = remote.app
window.$ = window.jQuery = require('jquery')
const Fancybox = require('@fancyapps/ui')
const bootstrap = require('bootstrap')
const dirTree = require("directory-tree")
const db = require('electron-db')
const tga2png = require('tga2png')
const moment = require('moment')
const { log } = require('console')
const lozad = require('lozad')


const appUserData = app.getPath('userData')

// create directory for coverted screenshots
const saveDirectory = appUserData.replace(/\\/g, '/') + "/screenshots/"
if (!fs.existsSync(saveDirectory)) {
  fs.mkdirSync(saveDirectory);
}



// https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
function dynamicSort(property) {
  var sortOrder = 1;
  if(property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
  }
  return function (a,b) {
      /* next line works with strings and numbers, 
       * and you may want to customize it to your needs
       */
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
  }
}

// https://momane.com/how-to-copy-image-and-text-to-clipboard-with-javascript
function imageToBlob(imageURL) {
  const img = new Image;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  img.crossOrigin = "";
  img.src = imageURL;
  return new Promise(resolve => {
    img.onload = function () {
      c.width = this.naturalWidth;
      c.height = this.naturalHeight;
      ctx.drawImage(this, 0, 0);
      c.toBlob((blob) => {
        // here the image is a blob
        resolve(blob)
      }, "image/png", 0.75);
    };
  })
}

async function copyImage(imageURL){
  const blob = await imageToBlob(imageURL)
  const item = new ClipboardItem({ "image/png": blob });
  navigator.clipboard.write([item]);
}



function insertGalleryCard(params) {
  $(".screenshot-list").append(galleryCard(params));
  $('.loading').hide()
}

function galleryCard(params) {
  return `
    <div class="col">
      <div class="card shadow-sm">
        <a data-src="${params.new_path}" data-fancybox="gallery" data-caption="${params.original_name}" class="pointer">
          <img data-src="${params.new_path}" class="card-img-top img-fluid lozad">
        </a>

        <div class="card-body">
          <p class="card-text">${params.original_name}</p>
          <div class="d-flex justify-content-between align-items-center">
            <div class="btn-group">
              <button type="button" class="btn btn-sm btn-outline-secondary">Share</button>
              <button type="button" class="btn btn-sm btn-outline-secondary copy-image" data-path="${params.new_path}">Copy</button>
            </div>
            <small class="text-muted">${formatDate(params.created_at)}</small>
          </div>
        </div>
      </div>
    </div>
  `
}

function formatDate(date) {
  const m = moment(date)
  return m.format('MM/DD/YYYY h:mm a')
}

function loadOriginalScreenshots() {
  // create array of screenshots
  const tree = dirTree('D:/wow/Vanilla WoW 1.12.1/Screenshots/', {extensions:/\.tga$/});
  return tree
}



$(() => {
  
  const observer = lozad();
  observer.observe();

  // load saved gallery
  db.getAll('screenshots', (succ, result) => {
    if (succ) {
      result.sort(dynamicSort("-created_at")).forEach(screenshot => {
        insertGalleryCard(screenshot)
        observer.observe();
      })
    }
  })


  // load original screenshots
  const originalScreenshots = loadOriginalScreenshots()
  console.log(originalScreenshots);

  if (originalScreenshots.children.length == 0) {
    // show no screenshot view
  } else {
    // grab screenshot data
    originalScreenshots.children.sort(dynamicSort("name")).forEach(screenshot => {
      // try to find a duplicate in the database
      db.getRows('screenshots', {
        original_name: screenshot.name.replace(screenshot.extension, '')
      }, (succ, result) => {
        if (succ) {
          // if its new lets insert it
          if (result.length == 0) {

            let obj = new Object();
            obj.original_name = screenshot.name.replace(screenshot.extension, '');
            obj.original_extension = screenshot.extension;
            obj.original_size = screenshot.size;
            obj.original_path = screenshot.path.replace(/\\/g, '/');

            const savePath = saveDirectory + obj.original_name + ".png"

            obj.new_path = savePath;
            
            const now = new Date()
            let created_at = now

            if (obj.original_name.includes("WoWScrnShot")) {
              const date = obj.original_name.split("_")[1].match(/.{1,2}/g) || []
              const year = "20" + date[2]
              const month = date[0] - 1
              const day = date[1]
              
              const time = obj.original_name.split("_")[2].match(/.{1,2}/g) || []
              const hour = time[0]
              const minute = time[1]
              const second = time[2]

              const parsedDate = new Date(year, month, day, hour, minute, second)

              created_at = parsedDate
            }

            obj.created_at = created_at;
            obj.updated_at = created_at;

            tga2png(obj.original_path, savePath).then(buf=> {
              if (db.valid('screenshots')) {
                db.insertTableContent('screenshots', obj, (succ, msg) => {
                  
                  insertGalleryCard(obj)
                  observer.observe();
                })
              }    
            }, err => {
              console.log('error converting screenshot', err);
            });

          }

        } else {
          console.log('An error has occured. ' + result)
        }
      })
    })
  }


  $('.copy-image').on('click', function() {
    copyImage($(this).data("path"))
  });

})