var yaml  = require('js-yaml'),
    q     = require('q'),
    fs    = require('q-io/fs'),
    util  = require('util');

// domain data
var monthNames = {
  "01": "Enero",
  "02": "Febrero",
  "03": "Marzo",
  "04": "Abril",
  "05": "Mayo",
  "06": "Junio",
  "07": "Julio",
  "08": "Agosto",
  "09": "Septiembre",
  "10": "Octubre",
  "11": "Noviembre",
  "12": "Diciembre"
};

// create tag files
function createTagFiles() {
  var contentTemplate = "---\nlayout: etiqueta\ntitle: Posts con la etiqueta %s\nsummary: postos con la etiqueta %s\ntag: %s\npermalink: /etiquetas/%s/\nsitemap: false\n---";
  var fileNameTemplate = __dirname + "/../etiquetas/%s.md";
  return fs.read(__dirname + '/../_data/etiquetas.yml', {'charset': 'utf8', 'flags': 'r'})
  .then(function(content){
    return yaml.safeLoad(content);
  })
  .then(function(doc){
    var promises = Object.keys(doc).map(function(key){
      var tagText = doc[key].name;
      var fileName = util.format(fileNameTemplate, key);
      var content = util.format(contentTemplate, tagText, tagText, key, key);
      return fs.exists(fileName)
      .then(function(exists){
        if(!exists)
          return fs.write(fileName, content);
      });
    });
    return q.all(promises);
  });
};

// create archive files
function getYearAndMonth(fileName){
  var array = fileName.split("-");
  return {
    year: array[0],
    month: array[1]
  };
};

function createSingleArchiveFile(monthDir, filePath, content){
  return fs.exists(monthDir)
  .then(function(exists){
    if(!exists)
      return fs.makeTree(monthDir);
  })
  .then(function(){
    return fs.exists(filePath);
  })
  .then(function(exists){
    if(!exists)
      return fs.write(filePath, content);
  });
};

function createArchiveFiles(){
  var contentTemplate = "---\nlayout: archive\ntitle: Publicado en %s\nsummary: publicado en %s\naño: '%s'\nmes: '%s'\nnombreMes: %s\nsitemap: false\n---";
  var archiveDir = __dirname + '/../archive/';

  return fs.list(__dirname + '/../_posts/')
  .then(function(files){
    console.log("Archivos: " + files.length);
    var data = {};
    for(var i=0; i<files.length; ++i){
      var file = files[i];
      var date = getYearAndMonth(file);
      if(!data[date.year]){
        data[date.year] = [];
      }
      if(data[date.year].indexOf(date.month) === -1){
        data[date.year].push(date.month);
      }
    }
    return data;
  })
  .then(function(data){
    var promises = [];
    for(var year in data){
      var yearDir = archiveDir + year.toString() + '/';
      data[year].forEach(function(month){
        var monthDir = yearDir + month.toString() + '/';
        var content = util.format(contentTemplate, monthNames[month] + " " + year, monthNames[month] + " " + year, year, month, monthNames[month]);
        var filePath = archiveDir + year + '/' + month + "/index.html";
        promises.push(createSingleArchiveFile(monthDir, filePath, content));
      });
    }
    return q.all(promises);
  });
};

// main entry point
module.exports = function(){
  return q.all([createTagFiles(), createArchiveFiles()]).then(function(){
    console.log("Creación de archivos de Etiqueta y Archive completados con éxito.")
  }).fail(function(e){
    console.error(e);
  });
};
