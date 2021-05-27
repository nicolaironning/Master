<template>
   <div id="circleMapContainer"></div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import json from '@/json/macDB.json';

export default {
  name: 'CircleMap',
  props: ['mac'],
  macDB: json,
  data() {
    return {
      zoom: 17,
      center: [0, 0],
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      myRenderer: L.canvas({padding: 0}),
      map: '',
      devices: [],
      ouis: []
    }
  },
  async mounted() {
    await this.getDevicesFromIDB();

    if(this.devices.length > 0) {
      this.center = [parseFloat(this.devices[0].currentLatitude), parseFloat(this.devices[0].currentLongitude)]
    } else {
      this.zoom = 1;
    }

    this.setupLeafletMap();

    // Get vendor
    json.forEach(x => { this.ouis.push(x.oui); });
  },
  methods: {
    async getDevicesFromIDB() {
      let result = await this.$idb.SimpleIDB.get('devices');
      this.devices = result == null ? [] : result;
    },
    setupLeafletMap: function () {
      const mapDiv = L.map('circleMapContainer').setView(this.center, this.zoom);

      L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
          attribution:
            'Map data (c) <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 25,
          id: "mapbox/streets-v11",
          accessToken:'pk.eyJ1Ijoibmljb2xhaXJvbm5pbmciLCJhIjoiY2tsOWh2eXM5MGJ1ZzJvczh0NWRtZDZ0YSJ9.rv1Dff1B42xEfbLPVbBnrQ',
        }
      ).addTo(mapDiv);

      var latlngs = [];

      for (var i = 0; i < this.devices.length; i ++) {
        var tmp = this.devices[i];

        latlngs.push(this.$turf.point([tmp.currentLatitude, tmp.currentLongitude]));

        if((!this.mac || tmp.mac.toUpperCase() == this.mac.toUpperCase())
            ) {

          L.circleMarker([parseFloat(tmp.currentLatitude),parseFloat(tmp.currentLongitude)], {
            renderer: this.myRenderer,
            radius: 5,
            color: this.getColor(tmp.type),
            type: tmp.type,
            ssid: tmp.ssid,
            mac: tmp.mac,
            authMode: tmp.authMode,
            firstSeen: tmp.firstSeen,
            currentLatitude: tmp.currentLatitude,
            currentLongitude: tmp.currentLongitude,
            channel: tmp.channel,
            rssi: tmp.rssi,

          }).addTo(mapDiv).bindTooltip(tmp.ssid + ': ' + tmp.mac, {permanent: true});
        }
      }

      //Convex hull
      var points = this.$turf.featureCollection(latlngs);
      var hull = this.$turf.convex(points);
      var polygon = hull.geometry.coordinates[0];
      L.polygon(polygon, {color: 'red'}).addTo(mapDiv);
    },
    getColor: function (type) {
      switch (type) {
        case 'WIFI':
          return  "#4DB6AC";
        case 'BT':
          return "#7986CB";
        case 'Trilaterated':
          return "#F06292";
        default:
          return 'white';
      }
    },
    thisDevice(mac) {
      this.inMac = mac;
    },
    sharedStart(array) {
      var A = array.concat().sort(), 
      a1 = A[0], a2= A[A.length-1], L= a1.length, i= 0;
      while(i < L && a1.charAt(i) === a2.charAt(i)) i++;
      return a1.substring(0, i);
    }
  }
}
</script>

<style scoped>
#circleMapContainer {
    height: 100%;
    width: 100%;
}
</style>