<template>
  <div class="main" v-if="devicesExist()">
    <div class="awards-cards" v-if="isMounted">
      <div class="award-card__wrapper"> 
        <p><b> Total devices: {{this.devices.length}} </b></p>
        <p> WIFI devices: {{types[0]}} <p>
        <p> Bluetooth devices: {{types[1]}} <p>
        <p> Other: {{types[2]}} </p>
      </div>

      <div v-if="isMounted" class="award-card__wrapper">
        <h5> Distribution of types: </h5>
        <pie-chart :data="typeData"></pie-chart>
      </div>

      <div class="award-card__wrapper">
        <div v-if="vendorsPressed">
          <h5> Distribution of vendors: </h5>
          <bar-chart :data="vendorData"></bar-chart>
        </div>
        <div v-else class="not-loaded">
          <p class="h4 text-center mb-4">Get vendor info</p>
          <mdb-btn v-if="!vendorLoading" class="button" color="primary" v-on:click="getVendorData"> Load vendor data </mdb-btn>
          <div v-else class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      </div>

      <div v-if="vendorCountriesPressed" class="award-card__wrapper">
        <h5> Distribution of vendor countries of origin: </h5>
        <bar-chart :data="vendorCountriesData"></bar-chart>
      </div>

      <div class="award-card__wrapper"> 
        <p><b> TVs scanned: {{ tvs.length }} </b></p>
        <div class="tvMapContainer" v-if="isMounted">
          <t-v-map class="tvMap" :inSsidCS="'TV'"></t-v-map>
        </div>
      </div>

      <div class="award-card__wrapper">
        <form>
          <p class="h4 text-center mb-4">Filter selection</p>
          <div class="grey-text">
            <mdb-input label="MAC" v-model="filterMac"/>
            <mdb-input label="SSID" v-model="filterSsid"/>
            <select class="browser-default custom-select selection" v-model="filterType">
              <option selected value="">All types</option>
              <option value="WIFI">WIFI</option>
              <option value="BT">BT</option>
            </select>
          </div>
          <div class="text-center">
            <mdb-btn color="primary" class="button" v-on:click="apply()">Update selection</mdb-btn>
          </div>
        </form>
      </div>

      <div class="award-card__wrapper">
        <div v-if="triPressed">
          <h5> Trilateration map 
            <span> 
              <mdb-btn class="button refresh" color="primary" v-on:click="triPressed = false"> 
                <mdb-icon icon="redo-alt" />
              </mdb-btn>
            </span>
          </h5>
          <div class="triMapContainer">
            <tri-map class="triMap" :mac="this.triFilterMac"></tri-map>
          </div>
        </div>
        <div v-else class="not-loaded">
          <p class="h4 text-center mb-4">Find location of device</p>
          <form>
            <mdb-input label="MAC" v-model="triFilterMac" />
            <mdb-btn v-if="!triLoading" class="button" color="primary" v-on:click="trilaterate(triFilterMac)"> Trilateration </mdb-btn>
            <div v-else class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </form>
        </div>
      </div>

      <div class="award-card__wrapper"> 
        <div v-if="addressPressed">
          <h5> Devices at {{this.address}} 
            <span> 
              <mdb-btn class="button refresh" color="primary" v-on:click="addressPressed = false"> 
                <mdb-icon icon="redo-alt" />
              </mdb-btn>
            </span>
          </h5>
          <mdb-scrollbar height="250px">
            <mdb-list-group v-for="device in this.closeDevices" v-bind:key="device.id">
              <mdb-list-group-item> {{device.ssid}} [{{device.mac}}] </mdb-list-group-item>
            </mdb-list-group>
          </mdb-scrollbar>
          <mdb-btn class="button" color="primary" v-on:click="addressMakeSelection"> 
            Make selection
          </mdb-btn>
        </div>
        <div v-else class="not-loaded">
          <p class="h4 text-center mb-4">Find devices at address</p>
          <form>
            <mdb-input label="Address" v-model="address" />
            <mdb-btn v-if="!addressLoading" class="button" color="primary" v-on:click="getAddressDevices"> See devices </mdb-btn>
            <div v-else class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </form>
        </div>
      </div>

      <div class="award-card__wrapper"> 
        <div v-if="timePressed">
          <h5> Times spotted: 
            <span> 
              <mdb-btn class="button refresh" color="primary" v-on:click="timePressed = false"> 
                <mdb-icon icon="redo-alt" />
              </mdb-btn>
            </span>
          </h5>
          <mdb-scrollbar height="250px">
          <mdb-list-group v-for="device in this.timeDevices" v-bind:key="device.id">
            <mdb-list-group-item> {{device}} </mdb-list-group-item>
          </mdb-list-group>
          </mdb-scrollbar>
          <mdb-btn class="button" color="primary" v-on:click="timeMakeSelection"> 
            Make selection
          </mdb-btn>
        </div>
        <div v-else class="not-loaded">
          <p class="h4 text-center mb-4">Find time device was spotted</p>
          <form>
            <mdb-input label="MAC" v-model="timeMac" />
            <mdb-btn v-if="!timeLoading" class="button" color="primary" v-on:click="getTimeDevice"> Get time spotted </mdb-btn>
            <div v-else class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </form>
        </div>
      </div>

      <div class="award-card__wrapper">
        <p class="h4 text-center mb-4">Filter distant duplicates</p>
        <mdb-input label="Distance" v-model="distance" />
        <mdb-btn class="button" color="primary" v-on:click="findDuplicates"> Filter distant duplicates </mdb-btn>
      </div>

      <div class="award-card__wrapper">
        <p class="h4 text-center mb-4">Remove duplicates</p>
        <mdb-btn class="button" color="primary" v-on:click="removeDuplicates"> Remove duplicates </mdb-btn>
      </div>

      <div class="award-card__wrapper">
        <p class="h4 text-center mb-4">Remove access points</p>
        <mdb-btn class="button" color="primary" v-on:click="removeAccessPoints"> Remove access points </mdb-btn>
      </div>

    </div>
  </div>
</template>

<script>
import PieChart from "./charts/PieChart.js";
import BarChart from "./charts/BarChart.js";
import TVMap from "./TVMap.vue";
import TriMap from "./TriMap.vue";
import json from '@/json/macDB.json';
import { mdbBtn, mdbInput, mdbScrollbar, mdbListGroup, mdbListGroupItem, mdbIcon } from "mdbvue";


export default {
  components: {
    PieChart,
    BarChart,
    TVMap,
    TriMap,
    mdbBtn,
    mdbInput,
    mdbScrollbar,
    mdbListGroup, 
    mdbListGroupItem,
    mdbIcon
  },
  macDB: json,
  data() {
    return {
      isMounted: false,
      devices: [],
      types: [],
      tvs: [],
      vendorsPressed: false,
      vendorCountriesPressed: false,
      vendorLoading: false,
      vendorData: {},
      vendorCountriesData: {},
      vendorsDict: {},
      vendorCountriesDict: {},
      address: '',
      addressPressed: false,
      addressLoading: false,
      distance: 0,
      timeMac: '',
      timeDevices: [],
      timePressed: false,
      timeLoading: false,
      closeDevices: [],
      triPressed: false,
      triLoading: false,
      triFilterMac: '',
      filterMac: '',
      filterSsid: '',
      filterType: '',
      typeData: {
        hoverBackgroundColor: "red",
        hoverBorderWidth: 10,
        labels: ["WIFI", "BT", "Other"],
        datasets: [
          {
            label: "Devices",
            backgroundColor: ["#4DB6AC", "#7986CB", "#F06292"],
            data: [0,0,0]
          }
        ]
      },
      getVendorDataTest: (devices, macjson) => {
        var vendors = [];
        var vendorCountries = [];
        var vendorsDict = {};
        var vendorCountriesDict = {};

        // Get vendors+countries for all entries
        for(var x = 0; x < devices.length; x++) {
          var mac = devices[x].mac;
          var longestLength = 0;
          var longestIndex = -1;

          for(var i = 0; i < macjson.length; i++) {
            if(macjson[i].oui.toUpperCase() == mac.substring(macjson[i].oui.length, 0).toUpperCase() && macjson[i].oui.length > longestLength) {
              longestIndex = i;
              break;
            }
          }
          
          var vendor = 'Unknown';
          var countryCode = '';

          if(longestIndex != -1) {
            vendor = macjson[longestIndex].companyName;
            countryCode = macjson[longestIndex].countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0)+127397) );
          }

          vendors[x] = vendor;
          vendorCountries[x] = countryCode;

          if(countryCode in vendorCountriesDict) {
            vendorCountriesDict[countryCode]++;
          } else {
            vendorCountriesDict[countryCode] = 0;
          }

          if(vendor in vendorsDict) {
            vendorsDict[vendor]++;
          } else {
            vendorsDict[vendor] = 0;
          }
        }

        return [vendorsDict, vendorCountriesDict];
      },
      getPointsFromLatLng: (lat1, lon1, devices) => {
        var tmpArr = [];
        for(var i = 0; i < devices.length; i++) {
          const tmp = devices[i];
          const lat2 = parseFloat(tmp.currentLatitude);
          const lon2 = parseFloat(tmp.currentLongitude);
          const R = 6371e3; // metres
          const φ1 = lat1 * Math.PI/180; // φ, λ in radians
          const φ2 = lat2 * Math.PI/180;
          const Δφ = (lat2-lat1) * Math.PI/180;
          const Δλ = (lon2-lon1) * Math.PI/180;
          const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const d = R * c; // in metres

          if(d < 10.0) {
            tmpArr.push(tmp);
          }
        }
        return tmpArr;
      },
      filterSelection(mac, ssid, type, devices) {
        var tmp = [];
        for(var i = 0; i < devices.length; i++) {
          if  (mac != '' && devices[i].mac.toUpperCase() == mac.toUpperCase() 
            || ssid != '' && devices[i].ssid.toUpperCase() == ssid.toUpperCase()
            || type != '' && devices[i].type.toUpperCase() == type.toUpperCase()) {
              tmp.push(devices[i]);
          }
        }
        return tmp;
      },
      filterDistantDuplicates(distance, devices) {
        function getNotUnique(array) {
          var map = new Map();
          array.forEach(a => map.set(a.mac, (map.get(a.mac) || 0) + 1));
          return array.filter(a => map.get(a.mac) > 1);
        }
        
        // Get all not unique devices and sort them by mac
        var tmp = getNotUnique(devices).sort((a,b) => (a.mac > b.mac) ? 1 : ((b.mac > a.mac) ? -1 : 0));

        // Get only devices not close to each other
        let i = 0, j = 1;
        while(i < tmp.length) {
          let lat1 = parseFloat(tmp[i].currentLatitude);
          let lon1 = parseFloat(tmp[i].currentLongitude);
          let lat2 = parseFloat(tmp[j].currentLatitude);
          let lon2 = parseFloat(tmp[j].currentLongitude);

          // Distance
          const R = 6371e3; // metres
          const φ1 = lat1 * Math.PI/180; // φ, λ in radians
          const φ2 = lat2 * Math.PI/180;
          const Δφ = (lat2-lat1) * Math.PI/180;
          const Δλ = (lon2-lon1) * Math.PI/180;
          const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const d = R * c; // in metres


          // If distance less than 50 meters, remove from array, if not inc. j
          if(d < distance) {
            tmp.splice(j,1);
          } else {
            i += 2;
            j = i + 1;
          }

          // If done
          if(typeof tmp[j+1] === 'undefined' && j - 1 === i) {
            tmp.splice(i, 1);
            break;
          }
          // If at last set of duplicates, but not done
          else if(typeof tmp[j+1] === 'undefined') {
            i++;
            j = i+1;
          }
          // If comparing different MACs, go to next set of duplicates
          else if(tmp[i].mac !== tmp[j].mac && j - 1 === i){
            tmp.splice(i, 1);
          }
          // If last of duplicates and i = j - 1, skip to next set of duplicates
          else if(tmp[j+1].mac !== tmp[j].mac && j - 1 === i) {
            continue;
          }
          // If last of current duplicates, skip to next value of i
          else if(tmp[j+1].mac !== tmp[j].mac) {
            i++;
            j = i+1;
          }
          // If not, keep going
        }
        return tmp;
      }
    }
  },
  async mounted() {
    await this.getDevicesFromIDB();
    this.typeData.datasets[0].data = this.types;
    this.isMounted = true;
  },
  methods: {
    async getDevicesFromIDB() {
      this.devices = await this.$idb.SimpleIDB.get('devices');

      // Check that devices were actually gotten from DB
      if(this.devices == null) {
        this.devices = [];
        return;
      }

      // Set types and TVs
      this.types = await this.$idb.SimpleIDB.get('types');
      this.tvs = await this.$idb.SimpleIDB.get('tvs');
    },
    devicesExist() {
      return this.devices.length != 0;
    },
    async getVendorData() {
      // Set loading icon
      this.vendorLoading = true;

      const devices = [...this.devices];
      const jsonArr = [...json];

      // Run getVendorData in other thread
      var result = await this.$worker.run(this.$data.getVendorDataTest, [devices, jsonArr])
      this.setVendorData(result);

      // Stop loading icon
      this.vendorLoading = false;

      // Set vendorsPressed & vendorCountriesPressed = true
      this.vendorsPressed = true;
      this.vendorCountriesPressed = true;
    },
    setVendorData(tuple) {
      this.vendorsDict = tuple[0];
      this.vendorCountriesDict = tuple[1];

      // TODO: Update vendorData & vendorCountriesData to reflect new values
      this.vendorsDict["Unknown"] = 0;
      const data = this.vendorsDict;
      var result = Object.keys(data).sort(function(a, b) {
        return data[b] - data[a];
      });

      this.vendorCountriesDict[""] = 0;
      const data2 = this.vendorCountriesDict;
      var result2 = Object.keys(data2).sort(function(a, b) {
        return data2[b] - data2[a];
      });


      this.vendorData = {
        labels: [result[0], result[1], result[2], result[3], result[4]],
        datasets: [{
          label: "# Of devices",
          backgroundColor: "#4DB6AC",
          data: [this.vendorsDict[result[0]], this.vendorsDict[result[1]], this.vendorsDict[result[2]], this.vendorsDict[result[3]], this.vendorsDict[result[4]]]
        }]
      }

      this.vendorCountriesData = {
        labels: [result2[0], result2[1], result2[2], result2[3], result2[4]],
        datasets: [{
          label: "# Of devices",
          backgroundColor: "#4DB6AC",
          data: [this.vendorCountriesDict[result2[0]], this.vendorCountriesDict[result2[1]], this.vendorCountriesDict[result2[2]], this.vendorCountriesDict[result2[3]], this.vendorCountriesDict[result2[4]]]
        }]
      }
    },
    async getAddressDevices() {
      this.addressLoading = true;

      const Nominatim = require('nominatim-geocoder')
      const geocoder = new Nominatim()

      var response = await geocoder.search({q: this.address})
      this.closeDevices = await this.$worker.run(this.$data.getPointsFromLatLng, [response[0].lat, response[0].lon, this.devices]);

      this.addressLoading = false;
      this.addressPressed = true;
    },
    addressMakeSelection() {
      this.initialize();
      this.devices = this.closeDevices;
      this.insertObject('devices', this.closeDevices);
      this.insertObject('types', this.getTypes());
      this.insertObject('tvs', this.getTVs());
      this.$emit('uploadSelection');
    },
    getTimeDevice() {
      this.timeLoading = true;

      this.timeDevices = [];

      for(var i = 0; i < this.devices.length; i++) {
        if(this.devices[i].mac == this.timeMac) {
          this.timeDevices.push(this.devices[i].firstSeen);
        }
      }

      this.timeLoading = false;
      this.timePressed = true;
    },
    timeMakeSelection() {
      console.log(this.timeDevices);
    },
    async initialize () {
      this.initialized = true;
      await this.$idb.SimpleIDB.initialize();
    },
    async insertObject(key, val) {
      await this.$idb.SimpleIDB.set(key, val)
    },
    getTypes() {
      var count = [0,0,0];
      var i;
      for(i = 0; i < this.devices.length; i++) {
        switch(this.devices[i].type) {
          case 'WIFI':
            count[0]++;
            break;
          case 'BT' || 'BLE':
            count[1]++;
            break;
          default:
            count[2]++;
        }
      }
      return count;
    },
    getTVs() {
      var tmp = [];
      var i;
      for(i = 0; i < this.devices.length; i++) {
        if(this.devices[i] && this.devices[i].ssid && this.devices[i].ssid.includes('TV')) {
          tmp.push(this.devices[i]);
        }
      }
      return tmp;
    },
    async apply() {
      this.devices = await this.$worker.run(this.$data.filterSelection, [this.filterMac, this.filterSsid, this.filterType, this.devices]);

      this.initialize();
      this.insertObject('devices', this.devices);
      this.insertObject('types', this.getTypes());
      this.insertObject('tvs', this.getTVs());
      this.$emit('uploadSelection');
    },
    trilaterate(mac) {
      this.triLoading = true;

      var tmp = [];
      for(var i = 0; i < this.devices.length; i++) {
        if(this.devices[i].mac.toUpperCase() == mac.toUpperCase()) {
          tmp.push(this.devices[i]);
        }
      }

      if(tmp.length > 2) {
        const point = this.trilateration(tmp[0], tmp[1], tmp[2])
        var obj = {
          id: this.devices.length,
          mac: mac,
          ssid: 'Trilateration Location',
          authMode: '',
          firstSeen: '',
          channel: '',
          rssi: '',
          currentLatitude: point[1],
          currentLongitude: point[0],
          altitudeMeters: '',
          accuracyMeters: '',
          type: 'Trilaterated',
        };

        this.devices.push(obj)

        this.initialize();
        this.insertObject('devices', this.devices);
        this.insertObject('types', this.getTypes());
        this.insertObject('tvs', this.getTVs());

        this.triLoading = false;
        this.triPressed = true;
      }
    },
    trilateration(p1, p2, p3) {
      const n = 2.185; // From citation

      const r1 = p1.rssi; // RSSI of point 1
      const r2 = p2.rssi; // RSSI of point 2
      const r3 = p3.rssi; // RSSI of point 3

      const y1 = p1.currentLatitude;//59.90709319603343;
      const x1 = p1.currentLongitude;//10.775689361914532;
      const y2 = p2.currentLatitude;//59.906349828767496;
      const x2 = p2.currentLongitude;//10.777379789641577;
      const y3 = p3.currentLatitude;//59.90925545430589;
      const x3 = p3.currentLongitude;//10.779494433391195;

      const d1 = Math.pow(10, (r1) / (10 * n)); // Distance between point 1 and source in lat/lon degrees
      const d2 = Math.pow(10, (r2) / (10 * n)); // Distance between point 2 and source in lat/lon degrees
      const d3 = Math.pow(10, (r3) / (10 * n)); // Distance between point 3 and source in lat/lon degrees

      const A = this.$math.matrix([
        [-2 * (x1 - x3), -2 * (y1 - y3)], 
        [-2 * (x2 - x3), -2 * (y2 - y3)]
      ]);

      const B = this.$math.matrix([
        (Math.pow(d1, 2) - Math.pow(d3, 2)) - (Math.pow(x1, 2) - Math.pow(x3, 2)) - (Math.pow(y1, 2) - Math.pow(y3, 2)), 
        (Math.pow(d2, 2) - Math.pow(d3, 2)) - (Math.pow(x2, 2) - Math.pow(x3, 2)) - (Math.pow(y2, 2) - Math.pow(y3, 2))
      ]);
      const X = this.$math.multiply(this.$math.inv(A), B);

      return X._data;
    },
    async findDuplicates() {
      this.devices = await this.$worker.run(this.$data.filterDistantDuplicates, [this.distance, this.devices]);
      

      this.initialize();
      this.insertObject('devices', this.devices);
      this.insertObject('types', this.getTypes());
      this.insertObject('tvs', this.getTVs());
      this.$emit('uploadSelection');
    },
    async removeDuplicates() {
      let tmp = [];
      let tmpMac = [];

      for(var i = 0; i < this.devices.length; i++) {
        if(!tmpMac.includes(this.devices[i].mac)) {
          tmpMac.push(this.devices[i].mac);
          tmp.push(this.devices[i]);
        }
      }

      this.devices = tmp;
      await this.insertObject("devices", tmp);

      this.$emit('uploadSelection');
    },
    async removeAccessPoints() {
      let tmp = [];

      for(var i = 0; i < this.devices.length; i++) {
        // If authmode is WPA -> probably an access point
        if(!(this.devices[i].authMode.substring(0, 4) === "[WPA")) {
          tmp.push(this.devices[i]);
        }
      }

      this.devices = tmp;
      await this.insertObject("devices", tmp);

      this.$emit('uploadSelection');
    }
  }
}
</script>

<style scoped>
* {
  padding:0px; 
  margin:0px;
}

*, *::before, *::after {
  box-sizing: border-box;
}

li {
  padding: 10px;
}

.awards-cards {
  column-count: 3;
  column-gap: 1em;
  max-width: 80%;
  margin: 0 auto;
  padding: 30px;
}

.award-card__wrapper {
  background-color: #eee;
  display: inline-block;
  margin: 0 0 1em;
  width: 100%;
  padding: 15px;
}

@media (max-width: 767px) {
  .awards-cards{ 
    column-count: 1;
    max-width: 100%;
    padding: 0px;
  }

  .router-view {
    padding: 10px;
  }
}

.main {
  overflow-y: auto;
  height: calc(100vh - 56px);
  padding: 20px 20px 0px 20px;
}

form {
  width: 100%;
}

.selection {
  margin: 10px 0px;
}

.else {
  text-align: center;
}

.button {
  margin: 0 auto;
  padding: 10px;
  width: 100%;
}

.refresh {
  width: 40px;
  height: 40px;
  border-radius: 20px;
}

.not-loaded {
  align-items: center;
  min-height: 250px;
}

.spinner-border {
  margin: 0 auto !important;
}

.module {
  background-color: #2196f3;
  border-radius: 10px;
  color: white;
  padding: 10px;
  margin: 20px;
  max-width: 280px;
}


.tvMapContainer {
  height: 270px;
  width: 100%;
}

.triMapContainer {
  height: 270px;
  width: 100%;
}

h1 {
  padding-top: 40vh;
}
</style>
