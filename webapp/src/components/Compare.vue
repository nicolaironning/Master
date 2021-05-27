<template> 
  <div class="container">
    <div v-if="!submitted || !filtered" class="title">
      <h1> Compare data: </h1>
    </div>
    <div v-else class="title green-text">
      <h1> Filtered data! </h1>
    </div>
    <upload-module v-if="!submitted" v-on:upload="handleUpload"></upload-module>
    <div v-if="submitted && !filtered" class="filter">
      <div class="flexbox">
        <mdb-btn class="button" color="secondary" v-on:click="intersect()">Intersection</mdb-btn>
        <mdb-btn class="button" color="secondary" v-on:click="difference()">Difference</mdb-btn>
        <mdb-btn class="button" color="secondary" v-on:click="sum()">Sum</mdb-btn>
      </div>
    </div>

  </div>
</template>

<script>
import UploadModule from './UploadModule';
import { mdbBtn } from "mdbvue";

export default {
  components: {
    UploadModule,
    mdbBtn
  },
  data() {
    return {
      devices: [],
      uploadedDevices: [],
      submitted: false,
      filtered: false,
      intersection: [],
      symmDiff: [],
      intersectTask: (arr1, arr2) => {
        return arr1.filter(c => arr2.findIndex(x => x.mac == c.mac) > -1);
      },
      differenceTask: (arr1, arr2) => {
        const getDifference = (a, b, fn) => {
          const setB = new Set(b.map(item => fn(item)));
          return [...a.filter(item => !setB.has(fn(item)))]
        };

        return getDifference(arr1, arr2, (x => x.mac));
      },
      sumTask: (arr1, arr2) => {
        return arr1.concat(arr2);
      },
    }
  },
  methods: {
    handleUpload(uploadedDevices) {
      this.uploadedDevices = uploadedDevices;
      this.submitted = true;
    },
    async intersect() {
      this.devices = await this.$worker.run(this.intersectTask, [this.devices, this.uploadedDevices]);
      this.save();
    },
    async difference() {
      // Buggy TODO
      //this.devices = await this.$worker.run(this.differenceTask, [this.devices, this.uploadedDevices]); 
      var arr1 = this.devices;
      var arr2 = this.uploadedDevices;

      const getSymmetricDifference = (a, b, fn) => {
        const setB = new Set(b.map(item => fn(item)));
        return [...a.filter(item => !setB.has(fn(item)))]
      };

      this.devices = getSymmetricDifference(arr1, arr2, (x => x.mac));
      this.save();
    },
    async sum() {
      this.devices = await this.$worker.run(this.sumTask, [this.devices, this.uploadedDevices]);
      this.save();
    },
    save() {
      // Initialize IndexedDB
      this.initialize();

      // devices
      this.insertObject('devices', this.devices);

      // types
      this.insertObject('types', this.getTypes());

      // tvs
      this.insertObject('tvs', this.getTVs());

      this.filtered = true;

      this.$emit('uploadSelection');
    },
    getTypes() {
      var count = [0,0,0,0];
      var i;
      for(i = 0; i < this.devices.length; i++) {
        switch(this.devices[i].type) {
          case 'WIFI':
            count[0]++;
            break;
          case 'BT':
            count[1]++;
            break;
          case 'BLE':
            count[2]++;
            break;
          default:
            count[3]++;
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
    async getDevicesFromIDB() {
      this.devices = await this.$idb.SimpleIDB.get('devices');
    },
    initialize () {
      this.initialized = true;
      this.$idb.SimpleIDB.initialize();
    },
    insertObject(key, val) {
      try {
        this.$idb.SimpleIDB.set(key, val)
      } catch(e) {
        console.log(e);
      }
    }
  },
  async mounted() {
    await this.getDevicesFromIDB();
  }
};
</script>

<style scoped>
.title {
  margin: 0 auto;
  padding-top: 10vh;
}

h1 {
  text-align: center;
}

.filter {
  margin-top: 8vh;
  text-align: center;
}

</style>
