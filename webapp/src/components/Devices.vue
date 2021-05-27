<template>
  <div class="wrapper">

    <mdb-datatable
    v-if="isMounted"
    :data="tableData"
    autoWidth
    striped
    bordered
    fixed
    scrollY
    maxHeight="80vh"
    :pagination="false"
  />
  </div>
</template>

<script>
import { mdbDatatable } from 'mdbvue';


export default {
  components: {
      mdbDatatable
  },
  data() {
    return {
      isMounted: false,
      tableData: {
        columns: [
          {
            label: 'ID',
            field: 'id',
            sort: true
          },
          {
            label: 'MAC',
            field: 'mac',
            sort: true
          },
          {
            label: 'SSID',
            field: 'ssid',
            sort: true
          },
          {
            label: 'Authentication',
            field: 'authMode',
            sort: true
          },
          {
            label: 'First Seen',
            field: 'firstSeen',
            sort: true
          },
          {
            label: 'Channel',
            field: 'channel',
            sort: true
          },
          {
            label: 'RSSI',
            field: 'rssi',
            sort: true
          },
          {
            label: 'Latitude',
            field: 'currentLatitude',
            sort: true
          },
          {
            label: 'Longitude',
            field: 'currentLongitude',
            sort: true
          },
          {
            label: 'Altitude',
            field: 'altitudeMeters',
            sort: true
          },
          {
            label: 'Accuracy',
            field: 'accuracyMeters',
            sort: true
          },
          {
            label: 'Type',
            field: 'type',
            sort: true
          }
        ],
        rows: [
          {
            id: 'Du skal',
            mac: 'ikke',
            ssid: 'se dette'
          }
        ]
      },
      devices: [],
    };
  },
  created() {
    this.tableData.rows = [{id: 1, mac: 1, ssid: 1}]
  },
  async mounted() {
    await this.getDevicesFromIDB();
    this.tableData.rows = this.devices;
    this.isMounted = true;
  },
  methods: {
    async getDevicesFromIDB() {
      this.devices = await this.$idb.SimpleIDB.get('devices');
      this.types = await this.$idb.SimpleIDB.get('types');
      this.tvs = await this.$idb.SimpleIDB.get('tvs');
    }
  },
  computed: {

  }
};
</script>

<style scoped>

.wrapper {
  padding: 20px;
  height: calc(100vh - 56px);
}

.container {
  margin: 0px;
  padding: 0px;
}

</style>