var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    notifier = require('node-notifier'),
    request = require('request'),
    open = require('open'),
    gpsUtil = require("gps-util"),
    Set = require("collections/set"),
    Map = require("collections/map"),
    config = require('./config.json');

var planebase,
    seen = new Map(),
    floor;

function printKml(id, err, result) {
  var fileName = util.format(config.output.format, id, Date.now());

  fs.writeFile(fileName, result, function(err) {
    if(err) {
      return console.log(err);
    }
  });
}

function notify(plane) {
  var message = util.format(config.notification.message, plane.hex, plane.flight);

  notifier.notify({
    title: config.notification.title,
    message: message,
    icon: path.join(__dirname, config.notification.image),
    image: path.join(__dirname, config.notitication.image),
    sound: true,
    wait: false
  }, function (err, response) {
    // response is response from notification
  });
}

function getPoints(plane) {
  return {
    lat :plane.lat,
    lng : plane.lon,
    ele : Math.ceil(plane.altitude / 3) ,
    time : new Date()
  };
  //plane.lo
}

function watch() {
  request(planebase + config.json_file, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      data = JSON.parse(body);
      var plane;
      var seenNow = new Set();

      for(plane in data) {
        seenNow.add(data[plane].hex);
        if (data[plane].altitude < floor && !(seen.has(data[plane].hex))) {
          notify(data[plane]);
          seen.add([getPoints(data[plane])],data[plane].hex);
        } else if (seen.has(data[plane].hex)) {
          seen.get(data[plane].hex).push(getPoints(data[plane]));
        }
      }

      ids = seen.keys();
      for (i=0 ; i < ids.length; i++ ) {
        if(!seenNow.contains(ids[i])) {
          //console.log(seen.get(ids[i]));

          // create a partially applied version of the printKml function
          // with the id argument already bound into place.
          gpsUtil.toKml(seen.get(ids[i]), printKml.bind(null, ids[i]));
          seen.delete(ids[i]);
        }
      }

    } else {
      console.log("error could not load plane data from:" + planeuri);
      process.exit(1);
    }
  });
}

notifier.on('click', function (notifierObject, options) {
  open(planebase);
});

notifier.on('timeout', function (notifierObject, options) {
  open(planebase);
});

planebase = process.argv[2];
floor = process.argv[3];

if(isNaN(floor)) {
  console.log("floor must be a numeric number not:" + floor);
  process.exit(1);
}

if(process.argv.length != 4) {
  console.log("takes 2 arguments, a base url e.g. http://www.example.net/ and a minimum height in feet e.g. 50000");
  process.exit(1);
}

setInterval(watch,2000);

