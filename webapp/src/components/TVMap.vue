<template>
   <div id="tvMapContainer"></div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import json from '@/json/macDB.json';

export default {
  name: 'TVMap',
  props: ['inSsidCS'],
  macDB: json,
  data() {
    return {
      zoom: 14,
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

      var container = L.DomUtil.get('tvMapContainer');
      if(container != null) {
        container._leaflet_id = null;
      }

      const mapDiv = L.map('tvMapContainer').setView(this.center, this.zoom);      

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

      var self = this;

      // When opening popup
      mapDiv.on('popupopen', function(e) {
          // Get specific marker
          var marker = e.popup._source;

          // Get MAC of marker
          var mac = marker.options.mac;

          // Helper variables
          var longestLength = 0;
          var longestIndex = -1;

          // Find matching MAC range in MAC DB JSON
          for(var i = 0; i < self.ouis.length; i++) {
            if(self.ouis[i].toUpperCase() == mac.substring(self.ouis[i].length, 0).toUpperCase() && self.ouis[i].length > longestLength) {
              longestIndex = i;
              longestLength = self.ouis[i].length;
            }
          }
          
          // Default values
          var vendor = 'Unknown';
          var countryCode = '';

          // If match found:
          if(longestIndex != -1) {
            vendor = json[longestIndex].companyName;
            countryCode = json[longestIndex].countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0)+127397) );
          }

          // Dynamically set content of popup
          marker._popup.setContent('[' + 
            marker.options.type + ']<br>' + 
            'SSID: ' + marker.options.ssid + '<br>' +
            'MAC: ' + marker.options.mac + '<br>' + 
            'Authorization Mode: ' + marker.options.authMode + '<br>' +
            'First Seen: ' + marker.options.firstSeen + '<br>' +
            'Lat: ' + marker.options.currentLatitude + '<br>' +
            'Lon: ' + marker.options.currentLongitude + '<br>' +
            'Channel: ' + marker.options.channel + '<br>' +
            'RSSI: ' + marker.options.rssi + '<br>' +
            'Vendor: ' + vendor + ' ' + countryCode);
      });


      for (var i = 0; i < this.devices.length; i ++) {
        var tmp = this.devices[i];

        if((!this.inSsidCS || tmp.ssid.includes(this.inSsidCS))
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

          }).addTo(mapDiv).bindPopup();
        }
      }
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
#tvMapContainer {
    height: 100%;
    width: 100%;
}
</style>