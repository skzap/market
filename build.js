console.log(new Date())
console.log('Starting build...')

const viewFolder = './src/view/';
const jsFolder = './src/js/';
const fs = require('fs');

// read original file
var code = fs.readFileSync('./src/index.html', 'utf8');

// add the views
var views = ''
addViews(viewFolder)
code = code.replace('@@VIEWS@@', views)
fs.writeFileSync('./dist/index.html', code);
console.log('Packaged views...')

// add the javascript
var scripts = ''
fs.readdirSync(jsFolder).forEach(file => {
  console.log(jsFolder+file)
  var contents = fs.readFileSync(jsFolder+file, 'utf8');
  scripts += contents+'\n'
})
fs.writeFileSync('./dist/js/raw.js', scripts);
console.log('Packaged javascripts...')

console.log('Succesfully built raw app!')
console.log(new Date())

function addViews(viewFolder) {
  fs.readdirSync(viewFolder).forEach(file => {
    console.log(viewFolder+file)
    if (file.endsWith('.html')) {
      var contents = fs.readFileSync(viewFolder+file, 'utf8');
      views += '<script id="'+file+'" type="text/html">'+contents+'</script>'
    } else {
      // its a folder probably
      addViews(viewFolder+file+'/')
    }
  })
}