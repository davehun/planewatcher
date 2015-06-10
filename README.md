# planewatcher
watches data from a dump1090 instance for low flying planes and logs to kml files.

## Building
To buid the fork of gps-utils from my github [here](https://github.com/davehun/gps-util).
The software will work without but the kml files will not have altitude data.

## Running
This needs [dump1090](https://github.com/antirez/dump1090) running in net mode:
>  dump1090 --net

You should now be able to visit the machine running dump1090 and see the map overlay.


> node plane.js http://$address $height

$height is the height in feet for anything that you wish to log / be notified for.
