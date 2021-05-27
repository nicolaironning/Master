<template>
  <div>
    <div id="mySidepanel" class="sidepanel" ref="sidepanel" :style="{width: menuOpen ? '280px' : '0px'}">
      <!--<a class="closebtn" v-on:click="menuOpen = false"> x </a> -->
      <form class="sidepanelForm">
        <h5> Filters </h5>
        <mdb-input label="SSID" v-model="filterSsid" />
        <mdb-input label="MAC" v-model="filterMac" />
        <select class="browser-default custom-select" v-model="filterType">
          <option selected value="">All types</option>
          <option value="WIFI">WIFI</option>
          <option value="BT">BT</option>
          <option value="GSM">GSM</option>
          <option value="LTE">LTE</option>
        </select>
        <mdb-btn class="applyButton" v-on:click="apply(filterSsid, filterMac, filterType)"> Apply </mdb-btn>
      </form>
    </div>

    <mdb-btn class="openbtn" v-on:click="menuOpen = !menuOpen">&#9776; </mdb-btn>

    <div class="simpleMapContainer">
      <simple-map class="simpleMap" :inSsid="this.filterSsid" :inMac="this.filterMac" :type="this.filterType" :key="this.updateMap" v-on:filter="deviceFilter"></simple-map>
    </div>
  </div>
</template>

<script>
import SimpleMap from "@/components/SimpleMap.vue";
import { mdbBtn, mdbInput } from 'mdbvue';
import macDB from '@/json/macDB.json';

export default {
  components: {
    SimpleMap,
    mdbBtn,
    mdbInput
  },
  data() {
    return {
      menuOpen: false,
      filterSsid: '',
      filterMac: '',
      filterType: '',
      updateMap: false,
      macDB
    }
  },
  methods: {
    apply(newSsid, newMac, newType) {
      this.filterSsid = newSsid;
      this.filterMac = newMac;
      this.filterType = newType;
      this.updateMap = !this.updateMap;
      this.menuOpen = false;
    },
    deviceFilter(device) {
      this.filterMac = device;
      this.updateMap = !this.updateMap;
    }
  },
  computed: {
    isDisabled: function() {
      return this.menuOpen;
    }
  }
};
</script>

<style scoped>
*:focus {
    outline: none;
}

.sidepanel {
  width: 0; /* 0 width - change this with JavaScript */
  position: fixed; /* Stay in place */
  z-index: 3; /* Stay on top */
  top: 56;
  left: 0;
  height: calc(100vh - 56px);
  background-color: #eee; /* Black*/
  overflow-x: hidden; /* Disable horizontal scroll */
  transition: 0.5s; /* 0.5 second transition effect to slide in the sidepanel */
}

.sidepanel:focus-within {
  width: 280px;
}

.sidepanelForm {
  padding: 20px;
  text-align: center;
}

.sidepanel a {
  padding: 8px 8px 8px 32px;
  text-decoration: none;
  font-size: 25px;
  color: #818181;
  display: block;
  transition: 0.3s;
}

.openbtn {
  position: fixed;
  bottom: 50px;
  right: 30px;
  font-size: 20px;
  cursor: pointer;
  background-color: #0099CC;
  border-radius: 30px;
  color: white;
  padding: 10px 15px;
  border: none;
  z-index: 2;
}

.filters {
  background-color: #eee;
  width: 100vw;
  height: 200px;
  position: fixed;
  top: 56px;
  right: 0;
  z-index: -1;
  width: 100vw;
}

.applyButton {
  width: 90%;
  margin-top: 30px;
}

.simpleMap {
  height: 100%;
  width: 100%;
  z-index: 0;
}

.simpleMapContainer {
  height: calc(100vh - 56px);
  width: 100vw;
}
</style>