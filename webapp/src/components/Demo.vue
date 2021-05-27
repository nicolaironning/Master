<template>
<carousel :per-page="1" :paginationPosition="'top'">
  <!-- =============== SCENARIO 1 =============== -->
  <slide>
    <div class="scenario">
      <h2> Experiment 1: </h2>
      <h5> Detecting if someone is home by scanning and seeing if consumer electronics like phones are present. </h5>
      <br>
      <h5> TODO </h5>
      <div class="step">
        <p> 1. Upload CSV-file of first scan: </p>
        <upload-module v-if="cnt1 === 0" v-on:upload="handleUpload(1, ...arguments)"></upload-module>
        <h5 v-else class="text-success"> Done! </h5>
      </div>
      <div class="step" v-if="cnt1 >= 1">
        <p> 2. Upload CSV-file of second scan: </p>
        <upload-module v-if="cnt1 === 1" v-on:upload="difference(1, devices, ...arguments)"></upload-module>
        <h5 class="text-success" v-else> Done! </h5>
      </div>
      <div class="step" v-if="cnt1 >= 2">
        <p> 3. Get list of devices at house: </p>
        <br>
        <p style="color:red;"> Red polygon: area of risk </p>
        <div class="circleMapContainer">
          <circle-map class="circleMap"></circle-map>
        </div>

        <p> List of devices: </p>

        <mdb-scrollbar height="250px">
          <mdb-list-group v-for="device in this.devices" v-bind:key="device.id">
            <mdb-list-group-item> {{device.ssid}} [{{device.mac}}] </mdb-list-group-item>
          </mdb-list-group>
        </mdb-scrollbar>
      </div>
    </div>
  </slide>

  <!-- =============== SCENARIO 2 =============== -->
  <slide>
    <div class="scenario">
      <h2> Experiment 2: </h2>
      <h5> Detecting if someone has visitors by counting the amount of consumer electronics present. </h5>
      <br>
      <div class="step">
        <p> 1. Upload CSV-file of first scan: </p>
        <upload-module v-if="cnt1 === 0" v-on:upload="handleUpload(2, ...arguments)"></upload-module>
        <h5 v-else class="text-success"> Done! </h5>
      </div>
      <div class="step" v-if="cnt1 >= 1">
        <p> 2. Upload CSV-file of second scan: </p>
        <upload-module v-if="cnt1 === 1" v-on:upload="difference(2, devices, ...arguments)"></upload-module>
        <h5 class="text-success" v-else> Done! </h5>
      </div>
      <div class="step" v-if="cnt1 >= 2">
        <p> 3. Get list of devices at house: </p>
        <br>
        <p style="color:red;"> Red polygon: area of risk </p>
        <div class="circleMapContainer">
          <circle-map class="circleMap"></circle-map>
        </div>

        <p> List of devices: </p>

        <mdb-scrollbar height="250px">
          <mdb-list-group v-for="device in this.devices" v-bind:key="device.id">
            <mdb-list-group-item> {{device.ssid}} [{{device.mac}}] </mdb-list-group-item>
          </mdb-list-group>
        </mdb-scrollbar>
      </div>
    </div>
  </slide>

  <!-- =============== SCENARIO 3 =============== -->
  <slide>
    <div class="scenario">
      <h2> Experiment 3: </h2>
      <h5> Detecting if someone has a specific medical condition by cross-referencing the devices in their home with devices spotted by a specialised medical clinic. </h5>
      <br>
      <div class="step">
        <p> 1. Upload CSV file where house was scanned: </p>
        <upload-module v-if="cnt3 == 0" v-on:upload="handleUpload(3, ...arguments)"></upload-module>
        <h5 v-else class="text-success"> Done! </h5>
      </div>
      <div class="step" v-if="cnt3 > 0">
        <p> 2. Enter address of house: </p>
        <mdb-input label="Address" v-model="address_3" />
        <mdb-btn class="button" v-if="cnt3 == 1" color="primary" v-on:click="limit_to_address(3)"> Submit </mdb-btn>
        <h5 class="text-success" v-else> Done! </h5>
      </div>
      <div class="step" v-if="cnt3 > 1">
        <p> 3. Upload CSV file where medical clinic was scanned: </p>
        <upload-module v-if="cnt3 == 2" v-on:upload="intersect(3, ...arguments)"></upload-module>
        <h5 v-else class="text-success"> Done! </h5>
      </div>
      <div class="step" v-if="cnt3 > 2">
        <p> 4. Enter address of clinic: </p>
        <mdb-input label="Address" v-model="address_3_2" />
        <mdb-btn class="button" v-if="cnt3 == 3" color="primary" v-on:click="limit_to_address(3)"> Submit </mdb-btn>
        <h5 class="text-success" v-else> Done! </h5>
      </div>
      <div class="step" v-if="cnt3 > 3">
        <p> 5. See if any devices match </p>
        <p v-if="devices.length != 0" class="text-success">
          Match(es) found
        </p>
        <p v-else class="text-alert">
          No matches found
        </p>
      </div>
    </div>
  </slide>

  <!-- =============== SCENARIO 4 =============== -->
  <slide>
    <div class="scenario">
      <h2> Experiment 4: </h2>
      <h5> Detecting if someone has visitors by counting the amount of consumer electronics present. </h5>
      <br>
    </div>
  </slide>
</carousel>
</template>


<script>
import { mdbBtn, mdbInput, mdbScrollbar, mdbListGroup, mdbListGroupItem, } from "mdbvue";
import json from "../json/sample.json";
import UploadModule from "@/components/UploadModule";
import { Carousel, Slide } from 'vue-carousel';
import CircleMap from '@/components/CircleMap';

export default {
  sample: json,
  components: {
    mdbBtn,
    mdbInput,
    mdbScrollbar, 
    mdbListGroup, 
    mdbListGroupItem,
    UploadModule,
    Carousel,
    Slide,
    CircleMap
  },
  data() {
    return {
      devices: [],
      cnt1: 0,
      cnt2: 0,
      cnt3: 0,
      cnt4: 0,
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
    }
  },
  async mounted() {
    
  },
  methods: {
    async limit_to_address(scenario) {
      let Nominatim = require('nominatim-geocoder')
      let geocoder = new Nominatim()

      var response = await geocoder.search({q: this.address_1})

      if(response.length == 0) {
        this.devices = [];
      } else {
        this.devices = await this.$worker.run(this.$data.getPointsFromLatLng, [response[0].lat, response[0].lon, this.devices]);
      }

      console.log(this.devices);

      switch(scenario) {
        case 1:
          this.cnt1++;
          break;
        case 2:
          this.cnt2++;
          break;
        case 3:
          this.cnt3++;
          break;
        case 4:
          this.cnt4++;
          break;
        case 5:
          this.cnt5++;
          break;
        case 6:
          this.cnt6++;
          break;
      }
    },
    upload2() {

    },
    upload_3_2() {

      //this.devices = arr1.filter(c => arr2.findIndex(x => x.mac == c.mac) > -1);
    },
    upload4() {

    },
    upload5() {

    },
    upload6() {

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
    handleUpload(scenario, uploadedDevices) {
      this.devices = uploadedDevices;
      this.saveDevices();

      switch(scenario) {
        case 1:
          this.cnt1++;
          break;
        case 2:
          this.cnt2++;
          break;
        case 3:
          this.cnt3++;
          break;
        case 4:
          this.cnt4++;
          break;
        case 5:
          this.cnt5++;
          break;
        case 6:
          this.cnt6++;
          break;
      }

      this.$emit('updateNavbar');
    },
    async saveDevices() {
      // Initialize IndexedDB
      this.initialize();

      // devices
      this.insertObject('devices', this.devices);

      // types
      this.insertObject('types', this.getTypes());

      // tvs
      this.insertObject('tvs', this.getTVs());

    },
    async initialize () {
      this.initialized = true;
      await this.$idb.SimpleIDB.initialize();
    },
    async insertObject(key, val) {
      await this.$idb.SimpleIDB.set(key, val)
    },
    intersect(scenario, uploadedDevices) {
      let old = this.devices;

      this.devices = old.filter(c => uploadedDevices.findIndex(x => x.mac == c.mac) > -1);

      this.saveDevices();

      switch(scenario) {
        case 1:
          this.cnt1++;
          break;
        case 2:
          this.cnt2++;
          break;
        case 3:
          this.cnt3++;
          break;
        case 4:
          this.cnt4++;
          break;
        case 5:
          this.cnt5++;
          break;
        case 6:
          this.cnt6++;
          break;
      }

      this.$emit('updateNavbar');
    },
    difference(scenario, arr1, arr2) {
      const getDifference = (a, b, fn) => {
        const setB = new Set(b.map(item => fn(item)));
        return [...a.filter(item => !setB.has(fn(item)))]
      };

      this.devices = getDifference(arr1, arr2, (x => x.mac));
      console.log(this.devices);
      this.saveDevices();

      switch(scenario) {
        case 1:
          this.cnt1++;
          break;
        case 2:
          this.cnt2++;
          break;
        case 3:
          this.cnt3++;
          break;
        case 4:
          this.cnt4++;
          break;
        case 5:
          this.cnt5++;
          break;
        case 6:
          this.cnt6++;
          break;
      }
    },
  }
}
</script>

<style scoped>
.scenario {
  margin: 25px;
  margin-top: 0px;
  padding: 25px;
  background-color: #eee;
}

.step {
  margin: 0 auto;
  padding: 25px;
  background-color: #ddd;
}

.circleMapContainer {
  height: 400px;
  padding: 25px 0px;
}
</style>