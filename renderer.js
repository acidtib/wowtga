// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

delete module.exports
const fs = require('fs');
const { remote } = require('electron');
const app = remote.app;
window.$ = window.jQuery = require('jquery');
const Fancybox = require('@fancyapps/ui')
const bootstrap = require('bootstrap');
const dirTree = require("directory-tree");
const db = require('electron-db');
const tga2png = require('tga2png');

const appUserData = app.getPath('userData')

// create directory for coverted screenshots
const saveDirectory = appUserData.replace(/\\/g, '/') + "/images/"
if (!fs.existsSync(saveDirectory)){
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

function insertGalleryCard(params) {
  $(".screenshot-list").append(galleryCard(params));
}

function galleryCard(params) {
  return `
    <div class="col">
      <div class="card shadow-sm">
        <a data-src="${params.new_path}" data-fancybox="gallery" data-caption="${params.original_name}" class="pointer">
          <img  src="${params.new_path}" class="card-img-top zoom img-fluid">
        </a>

        <div class="card-body">
          <p class="card-text">${params.original_name}</p>
          <div class="d-flex justify-content-between align-items-center">
            <div class="btn-group">
              <button type="button" class="btn btn-sm btn-outline-secondary">Share</button>
              <button type="button" class="btn btn-sm btn-outline-secondary">Copy</button>
            </div>
            <small class="text-muted">${params.created_at}</small>
          </div>
        </div>
      </div>
    </div>
  `
}

$(() => {
  console.log("hi")

  

  // Fancybox.Fancybox.defaults.btnTpl.delete = '<button data-fancybox-delete class="fancybox-button fancybox-button--delete" title="title of the icon">put yo</button>';
  // console.log(Fancybox.Fancybox.defaults);
  // $.fancybox.defaults.buttons = [
  //   'slideShow',
  //   'fullScreen',
  //   'thumbs',
  //   'delete', // this one is the new button
  //   'close'];

  // $('body').on('click', '[data-fancybox-delete]', function(e) {
  //   var src = $.fancybox.getInstance().current.src;
  //   var idx = $.fancybox.getInstance().current.opts.$orig;    
    
  //   console.log(src);
  //   console.log(idx);
  // });

  // $(".zoom").hover(function(){
  //   $(this).addClass('transition');
  //   }, function(){
        
  //   $(this).removeClass('transition');
  // });

  db.getAll('screenshots', (succ, result) => {
    if (succ) {
      result.sort(dynamicSort("-created_at")).forEach(screenshot => {
        insertGalleryCard(screenshot)
      })
    }
  })


  // create array of screenshots
  const tree = dirTree('D:/wow/Vanilla WoW 1.12.1/Screenshots/', {extensions:/\.tga$/});
  console.log(tree);

  // // grab screenshot data
  // tree.children.sort(dynamicSort("-name")).forEach(screenshot => {
  //   // try to find a duplicate in the database
  //   db.getRows('screenshots', {
  //     original_name: screenshot.name.replace(screenshot.extension, '')
  //   }, (succ, result) => {
  //     if (succ) {
  //       // if its new lets insert it
  //       if (result.length == 0) {

  //         let obj = new Object();
  //         obj.original_name = screenshot.name.replace(screenshot.extension, '');
  //         obj.original_extension = screenshot.extension;
  //         obj.original_size = screenshot.size;
  //         obj.original_path = screenshot.path.replace(/\\/g, '/');

  //         const savePath = saveDirectory + obj.original_name + ".png"

  //         obj.new_path = savePath;
          
  //         const now = new Date()
  //         let created_at = now

  //         if (obj.original_name.includes("WoWScrnShot")) {
  //           const date = obj.original_name.split("_")[1].match(/.{1,2}/g) || []
  //           const year = "20" + date[2]
  //           const month = date[0] - 1
  //           const day = date[1]
            
  //           const time = obj.original_name.split("_")[2].match(/.{1,2}/g) || []
  //           const hour = time[0]
  //           const minute = time[1]
  //           const second = time[2]

  //           const parsedDate = new Date(year, month, day, hour, minute, second)

  //           created_at = parsedDate
  //         }

  //         obj.created_at = created_at;
  //         obj.updated_at = now;

  //         tga2png(obj.original_path, savePath).then(buf=> {
  //           if (db.valid('screenshots')) {
  //             db.insertTableContent('screenshots', obj, (succ, msg) => {

  //               $(".screenshot-list").prepend(`
  //                 <div class="col">
  //                   <div class="card shadow-sm">
  //                     <a data-src="${obj.new_path}" data-fancybox="gallery" data-caption="${obj.original_name}">
  //                       <img  src="${obj.new_path}" class="card-img-top zoom img-fluid">
  //                     </a>

  //                     <div class="card-body">
  //                       <p class="card-text">${obj.original_name}</p>
  //                       <div class="d-flex justify-content-between align-items-center">
  //                         <div class="btn-group">
  //                           <button type="button" class="btn btn-sm btn-outline-secondary">Share</button>
  //                           <button type="button" class="btn btn-sm btn-outline-secondary">Copy</button>
  //                         </div>
  //                         <small class="text-muted">${obj.created_at}</small>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 </div>
  //               `);
  //             })
  //           }    
  //         }, err => {
  //           console.log('error converting screenshot', err);
  //         });

  //       }

  //     } else {
  //       console.log('An error has occured. ' + result)
  //     }
  //   })
  // });



  // Fancybox.Fancybox.bind('[data-fancybox="gallery"]', {
  //   closeButton : false,
  // });

})