<template>
  <div v-if="!uploaded" class="container">
    <div class="title">
      <h1> Upload csv file of scanned devices: </h1>
    </div>
    <upload-module v-if="!uploaded" v-on:upload="handleUpload"></upload-module>
  </div>
  <div v-else>
    <div class="uploaded">
      <h1 class="green-text"> Uploaded {{this.devices.length}} devices! </h1>
    </div>
  </div>
</template>

<script>
import UploadModule from './UploadModule';

export default {
  components: {
    UploadModule
  },
  data() {
    return {
      file: "",
      csv: "",
      devices: [],
      types: [],
      tvs: [],
      uploaded: false,
      initialized: false,
    }
  },
  mounted() {

  },
  methods: {
    handleUpload(uploadedDevices) {
      this.devices = uploadedDevices;
      this.saveDevices();
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

      // done
      this.uploaded = true;

      this.$emit('uploadSelection');
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
    async initialize () {
      this.initialized = true;
      await this.$idb.SimpleIDB.initialize();
    },
    async insertObject(key, val) {
      await this.$idb.SimpleIDB.set(key, val)
    },
    async removeObject (key) {
      await this.$idb.SimpleIDB.remove(key)
    }
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

.form-outline {
  margin: 0 auto;
  margin-top: 8vh;
  max-width: 260px;
  display: block;
  text-align: center;
  padding: 25px;
  background-color: #eee;
}

.label {
  max-width: 210px;
  margin: 0 auto;
}

#file {
  max-width: 210px;
}

.button {
  margin: 0 auto;
  margin-top: 20%;
}

.uploaded {
  margin-top: 10vh;
}
</style>
