<template>
  <div class="form-outline">
    <div class="form">
      <input type="checkbox" id="wifi" value="WiFi" v-model="wifi"> <span> Include Wi-Fi devices </span>
      <br>
      <input type="checkbox" id="bt" value="BT" v-model="bt"> <span> Include Bluetooth devices </span>
      <br>
      <input type="checkbox" id="ssid" value="SSID" v-model="ssid"> <span> Include devices with no SSID </span>
    </div>
    <label class="label">
      <input
        type="file"
        id="file"
        ref="file"
        accept=".csv"
        v-on:change="handleFileUpload()"
      />
    </label>
    <mdb-btn class="button" color="primary" v-on:click="submitFile()"
      >Submit</mdb-btn
    >
  </div>
</template>

<script>
import { mdbBtn } from "mdbvue";
import json from "../json/sample.json";

export default {
  components: {
    mdbBtn
  },
  sample: json,
  data() {
    return {
      file: new Blob(),
      devices: [],
      wifi: true,
      bt: true,
      ssid: true
    }
  },
  methods: {
    handleFileUpload() {
      this.file = this.$refs.file.files[0];
    },
    async submitFile() {
      await this.submitFileHelper();

      this.$emit('upload', this.devices);
    },
    submitFileHelper() {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        // If no file supplied, use sample JSON
        if(this.file.size == 0) {
          reader.onload = () => {
            for(var i = 0; i < json.length; i++) {
              var tmp = json[i];

              // Skip cell devices
              if(tmp.Type == 'GSM' || tmp.Type == 'LTE') continue;

              // Skip devices with no timestamp
              if(tmp.FirstSeen.includes('1970')) continue;

              // Filter Wi-Fi checked
              if(!this.wifi && tmp.Type == 'WIFI') continue;

              // Filter BT checked
              if(!this.bt && (tmp.Type == 'BLE' || tmp.Type == 'BT')) continue;

              // Filter no ssid
              if(!this.ssid && tmp.SSID == '') continue;

              const jitterLat = Math.random() * 0.00001;
              const jitterLon = Math.random() * 0.00001;
              const sign = Math.random() < 0.5 ? -1 : 1;

              var obj = {
                id: i,
                mac: tmp.MAC,
                ssid: tmp.SSID,
                authMode: tmp.AuthMode,
                firstSeen: tmp.FirstSeen,
                channel: tmp.Channel,
                rssi: tmp.RSSI,
                currentLatitude: parseFloat(tmp.CurrentLatitude) + jitterLat * sign,
                currentLongitude: parseFloat(tmp.CurrentLongitude) + jitterLon * sign,
                altitudeMeters: tmp.AltitudeMeters,
                accuracyMeters: tmp.AccuracyMeters,
                type: tmp.Type == 'BLE' ? 'BT' : tmp.Type,
              };

              this.devices.push(obj);
            }
            resolve(this.devices);
          }
        } 
        // If file supplied, use uploaded CSV
        else {
          reader.onload = (e) => {
            var arr = e.target.result.split("\n");

            for (var i = 2; i < arr.length - 1; i++) {
              var tmp = arr[i].split(",");

              // Skip cell devices
              if(tmp[10] == 'GSM' || tmp[10] == 'LTE') continue;

              // Skip devices with no timestamp
              if(tmp[3].includes('1970')) continue;

              // Filter Wi-Fi checked
              if(!this.wifi && tmp[10] == 'WIFI') continue;

              // Filter BT checked
              if(!this.bt && (tmp[10] == 'BLE' || tmp[10] == 'BT')) continue;

              // Filter no ssid
              if(!this.ssid && tmp[1] == '') continue;

              // Add jitter to make all devices clickable on map
              const jitterLat = Math.random() * 0.00001;
              const jitterLon = Math.random() * 0.00001;
              const sign = Math.random() < 0.5 ? -1 : 1;

              var obj = {
                id: i - 2,
                mac: tmp[0],
                ssid: tmp[1],
                authMode: tmp[2],
                firstSeen: tmp[3],
                channel: tmp[4],
                rssi: tmp[5],
                currentLatitude: parseFloat(tmp[6]) + jitterLat * sign,
                currentLongitude: parseFloat(tmp[7]) + jitterLon * sign,
                altitudeMeters: tmp[8],
                accuracyMeters: tmp[9],
                type: tmp[10] == 'BLE' ? 'BT' : tmp[10],
              };

              this.devices.push(obj);
            }
            resolve(this.devices);
          };
        }

        // Make sure to handle error states
        reader.onerror = function(e) {
          reject(e);
        };

        reader.readAsText(this.file);
      })
    }
  },
  mounted() {
    
  }
}
</script>

<style scoped>
.form-outline {
  margin: 0 auto;
  margin-top: 8vh;
  max-width: 260px;
  display: block;
  text-align: center;
  padding: 25px;
  background-color: #eee;
}

.form {
  margin: 0 auto;
  padding: 5px 5px 25px 5px;
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
  margin-top: 40vh;
}
</style>
