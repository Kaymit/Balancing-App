<template>
  <div mobi-stationlist>
    <v-toolbar class="elevation-1" color="white">
      <v-btn round flat large bold color="primary" v-on:click='isListActive = !isListActive'>Mobi Stations</v-btn>
      <v-btn round flat large bold color="red accent-2" v-on:click='isListActive = !isListActive'>High Priority Issues</v-btn>
      <v-btn round flat large bold color="orange darken-3" v-on:click='isListActive = !isListActive'>Medium Priority Issues</v-btn>
      <v-btn round flat large bold color="green darken-1" v-on:click='isListActive = !isListActive'>Low Priority Issues</v-btn>
      <v-spacer></v-spacer>
      <v-btn round color="primary" @click="dialog = true">Options</v-btn>
      <v-dialog v-model="dialog" max-width="35%">
        <v-card>
          <v-card-title class="headline">Options</v-card-title>
          <v-card-actions>
            <v-container fluid>
              <v-switch v-model="stationIdRow" :label="'Station ID'"></v-switch>
              <v-switch v-model="totalSlotsRow" :label="'Total Slots'"></v-switch>
              <v-switch v-model="freeSlotsRow" :label="'Free Slots'"></v-switch>
              <v-switch v-model="avlBikesRow" :label="'Available Bikes'"></v-switch>
            </v-container>
              <v-switch v-model="expand" :label="`${expand ? 'Multiple expanded rows' : 'One expanded row'}`"></v-switch>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-btn round color="primary" dark v-on:click="getStations">Refresh</v-btn>
    </v-toolbar>
    <v-data-table
      v-if="isListActive"
      :headers="headers"
      :items="stations"
      :expand="expand"
      class="elevation-2"
      v-bind:pagination.sync="pagination"
      item-key="name"
      must-sort
    >
<!-- Vue binds style to object referencing prop item, key is a workaround from 
https://stackoverflow.com/questions/50289811/vuetify-table-custom-css-isnt-applied-to-first-row-after-page-reload
because first item in table was not rendering inline CSS 
-->
      <template slot="items" slot-scope="props">
        <tr 
          :key="props.index" 
          :style="{ 
            backgroundSize: ((props.item.percent_full) + '% 100%'),
            borderRadius: '14px',
            backgroundClip: 'padding-box',
            padding: '10px',
            position: 'relative',
            textShadow: '0.7px 0.7px 1px #5B73A3FF',

          }" 
          @click="props.expanded = !props.expanded"
          class="elevation-1"
        >
          <td 
            v-for="header in headers" 
            :key="header.station_id"
            class="text-xs-left">{{ props.item[header.value] }}
          </td>
        </tr>
      </template>
      <template slot="expand" slot-scope="props">
        <v-card flat>
          <v-card-text>
            Station: {{ props.item.name }} <br />
            Total Slots: {{ props.item.total_slots }}
          </v-card-text>
        </v-card>
      </template>
    </v-data-table>
  </div>
</template>

<script>
//import Station from './Station.vue'
import axios from 'axios'

export default {
  name: 'StationList',
  data: function() {
    return {
      expand: false,
      pagination: {
          'descending': true,
          'rowsPerPage': 300,
          'sortBy': 'free_slots'
      },
      headers: [
        { text: 'ID', value: 'station_id' },
        { text: 'Station Name', value: 'name' },
        { text: 'Total Slots',   value: 'total_slots' },
        { text: 'Free Slots',   value: 'free_slots' },
        { text: 'Available Bikes',  value: 'avl_bikes' },
      ],
      stations: [],
      isListActive: true,
      dialog: false,
      totalSlotsRow: true,
      freeSlotsRow: true,
      avlBikesRow: true,
      stationIdRow: true,
    }
  },
  props: {
    msg: String
  },
  created: 
    function () {  
      this.getStations()
    },
  methods: {
    getStations() {
//Currently switching the request param for production
      //axios.get('http://localhost:3000')
      axios.get('http://balancing-api.herokuapp.com:80')
        .then((response) => {
            if (response.data != null)
              this.stations = this.processStations(response.data);
            else
              console.log('failure to fetch data');
        })
    },
    processStations(stations) {
      for (let station of stations) {
        station.percent_full = station.avl_bikes / station.total_slots * 100;
        station.bike_inventory = station.avl_bikes + ' / ' + station.total_slots;
        station.station_id = station.name.slice(0,4);
        station.name = station.name.slice(5);
      }
      return stations;
    },
  },
  watch: {
    totalSlotsRow(newValue) {
      if (newValue == false)
        this.headers = this.headers.filter(header => header.value != 'total_slots');
      else {
        let newHeader = { text: "Total Slots", value: "total_slots"};
        this.headers.push(newHeader);
      }
    },
    freeSlotsRow(newValue) {
      if (newValue == false)
        this.headers = this.headers.filter(header => header.value != 'free_slots');
      else {
        let newHeader = { text: "Free Slots", value: "free_slots"};
        this.headers.push(newHeader);
      }
    },
    avlBikesRow(newValue) {
      if (newValue == false)
        this.headers = this.headers.filter(header => header.value != 'avl_bikes');
      else {
        let newHeader = { text: "Available Bikes", value: "avl_bikes"};
        this.headers.push(newHeader);
      }
    },
    stationIdRow(newValue) {
      if (newValue == false)
        this.headers = this.headers.filter(header => header.value != 'station_id');
      else {
        let newHeader = { text: "Station ID", value: "station_id"};
        this.headers.unshift(newHeader);
      }
    }
  }
}
</script>

<style scoped>
tr {
  background-image: linear-gradient(to right, rgba(15, 85, 125, 0.66) 0%, rgba(20, 95, 145, 0.60) 15%, rgba(25, 85, 125, 0.68) 55%);
}
td {

}
table {
  margin: 20px;
  padding: 8px;
}
a {
  color: #42b983;
}
</style>