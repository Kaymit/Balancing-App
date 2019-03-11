<template>
  <div>
    <v-divider id="topScroll"/>
      <v-toolbar 
        scroll-off-screen 
        app
        style="z-index: 3;"
      >
        <v-btn icon v-on:click='drawer = !drawer'>
          <v-icon large>mdi-menu</v-icon>
        </v-btn>
        <v-toolbar-title class="hidden-sm-and-down">MobiExpress</v-toolbar-title>
        <v-toolbar-items class="hidden-md-and-down">
          <v-btn round flat large bold color="primary" v-on:click='isListActive = !isListActive'>Mobi Stations</v-btn>
          <v-btn round flat large bold color="red accent-2" v-on:click='isListActive = !isListActive'>High Priority Issues</v-btn>
          <v-btn round flat large bold color="orange darken-3" v-on:click='isListActive = !isListActive'>Medium Priority Issues</v-btn>
          <v-btn round flat large bold color="green darken-1" v-on:click='isListActive = !isListActive'>Low Priority Issues</v-btn>
        </v-toolbar-items>
        <v-spacer></v-spacer>
        <v-btn icon v-on:click="getStations">
          <v-icon large>mdi-refresh</v-icon>
        </v-btn>
        <v-btn @click="dialog = true" icon>
          <v-icon large>mdi-dots-vertical</v-icon>
        </v-btn>
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
      </v-toolbar>
      <v-btn
        small
        color="blue darken-2"
        primary
        fixed
        top
        right
        fab
        @click="scrollToTop"
        style="z-index: 2;"
      >
        <v-icon large>mdi-chevron-double-up</v-icon>
      </v-btn>

      <v-navigation-drawer
        v-model="drawer"
        fixed
        temporary
      >
        <v-list class="pa-1">
          <v-list-tile avatar>
            <v-list-tile-avatar>
              <img src="https://randomuser.me/api/portraits/men/85.jpg">
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>John Leider</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-list class="pt-0" dense>
          <v-divider></v-divider>

          <v-list-tile
            v-for="item in drawerItems"
            :key="item.title"
          >
          <!--
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
          -->
            <v-list-tile-content>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>
    
      <v-data-table
        v-if="isListActive"
        :headers="headers"
        :items="stations"
        :expand="expand"
        class="elevation-2"
        v-bind:pagination.sync="pagination"
        item-key="name"
        must-sort
        subheading
      >
        <template slot="items" slot-scope="props">
          <tr 
            :key="props.index" 
            :style="{ 
              backgroundSize: ((props.item.percent_full) + '% 100%'),
              backgroundClip: 'padding-box',
              padding: '10px',
              position: 'relative',
              textShadow: '0.7px 0.7px 1px rgba(230,220,255,0.7)',
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
          <v-container grid-list-md text-xs-center>
            <v-layout row wrap align-center>
              <v-flex xs4 fill-height headline>
                <a v-bind:href="'https://vancouver-ca.smoove.pro/stations/#/' + props.item.station_id"> 
                  {{ props.item.name }} 
                </a>
              </v-flex>
              <v-flex xs4>
                <v-progress-circular
                  :rotate="360"
                  :size="100"
                  :width="15"
                  :value="props.item.battery_level"
                  color="green darken-1"
                >
                  {{ (props.item.battery_level * 13.6 / 100).toFixed(2) }} V
                </v-progress-circular>
              </v-flex>
              <v-flex xs4 fill-height headline>
                Slots: {{ props.item.total_slots }}
              </v-flex>
            </v-layout>
          </v-container>
        </template>
      </v-data-table>
  </div>
</template>

<script>
//import Station from './Station.vue'
//import axios from 'axios'
import StationService from '../services/StationService.js'

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
      drawer: null,
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
      StationService.fetchStations()
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
    scrollToTop() {
      let options = {
        duration: 600,
        offset: 0,
        easing: "easeInOutCubic"
      }
      this.$vuetify.goTo("#topScroll", options);
      return;
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
  background-image:  rgb(76,111,155); /* Old browsers */
  background-image: -moz-linear-gradient(top, rgba(76,111,155,0.8) 0%, rgba(45,124,175,0.8) 51%, rgba(80,140,180,1) 100%); /* FF3.6-15 */
  background-image: -webkit-linear-gradient(top, rgba(76,111,155,1) 0%, rgba(45,124,175,1) 51%, rgba(80,140,180,1) 100%); /* Chrome10-25,Safari5.1-6 */
  background-image: linear-gradient(to bottom, rgba(76,111,155,0.8) 0%, rgba(45,124,175,0.8) 51%, rgba(80,140,180,0.6) 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4c6f9b', endColorstr='#6eb1e5',GradientType=0 ); /* IE6-9 */
}
tr:nth-child(1n) td:first-child { 
  border-top-left-radius: 10px; 
  border-bottom-left-radius: 10px;
}
tr:nth-child(1n) td:last-child { 
  border-top-right-radius: 10px; 
  border-bottom-right-radius: 10px;
}
tr:nth-child(2n) {
  background-color: rgb(237, 243, 252);
}
table {
  margin: 20px;
  padding: 8px;
  border-collapse: separate;
}
</style>