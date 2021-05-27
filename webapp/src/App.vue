<template>
  <div id="app">
    <div class="header">
      <mdb-navbar color="info-color-dark white-text" dark>
        <mdb-navbar-brand>
          IoT Mapper
        </mdb-navbar-brand>
        <mdb-navbar-toggler>
          <mdb-navbar-nav v-bind:key="updateNavbar">
            <mdb-nav-item anchorClass="white-text" to="Dashboard"> <mdb-icon icon="desktop" /> Dashboard</mdb-nav-item>
            <mdb-nav-item anchorClass="white-text" to="Devices"> <mdb-icon icon="tablet-alt" /> Devices</mdb-nav-item>
            <mdb-nav-item anchorClass="white-text" to="Map"> <mdb-icon far icon="map" /> Map</mdb-nav-item>
            <mdb-nav-item anchorClass="white-text" to="Compare"> <mdb-icon icon="arrows-alt-h" /> Compare</mdb-nav-item>
            <mdb-nav-item anchorClass="white-text" to="Upload"> <mdb-icon icon="upload" /> Upload</mdb-nav-item>
          </mdb-navbar-nav>
          <span class="navbar-text">
            {{this.devices.length}} devices selected
          </span>
          <!-- Clear button, is it really necessary?
          <mdb-btn outline="white" size="xs" type="button" @click="clearSelection">
            Clear
          </mdb-btn>
          -->
        </mdb-navbar-toggler>
      </mdb-navbar>
    </div>
    <div class="content">
      <router-view class="router-view" v-on:uploadSelection="updateSelection" v-on:updateNavbar="updateNavbarFunc" v-bind:key="updateDOM"></router-view>
    </div>
  </div>
</template>

<script>
import { mdbNavbar, mdbNavbarBrand, mdbNavbarToggler, mdbNavbarNav, mdbNavItem } from 'mdbvue';
import { mdbIcon/*, mdbBtn*/ } from 'mdbvue';

export default {
  name: "App",
  components: {
    mdbNavbar,
      mdbNavbarBrand,
      mdbNavbarToggler,
      mdbNavbarNav,
      mdbNavItem,
      mdbIcon,
      //mdbBtn
  },
  data() {
    return {
      devices: [],
      dbinitialized: false,
      updateDOM: false,
      updateNavbar: false,
    }
  },
  methods: {
    async updateSelection() {
      var result = await this.$idb.SimpleIDB.get('devices');
      this.devices = result == null ? [] : result;
      this.updateDOM = !this.updateDOM;
    },
    async updateNavbarFunc() {
      var result = await this.$idb.SimpleIDB.get('devices');
      this.devices = result == null ? [] : result;
      this.updateNavbar = !this.updateNavbar;
    },
    async clearSelection() {
      await this.$idb.SimpleIDB.initialize();
      this.updateSelection();
    }
  },
  async mounted() {
    this.updateSelection()
  }
}

</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap");

#app {
  background-color: white;
}

.content {
  height: calc(100vh - 56px);
}
</style>
