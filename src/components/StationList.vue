<template>
  <div mobi-stationlist>
    <v-toolbar flat color="white">
    <v-toolbar-title>Mobi Stations</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-switch v-model="expand" :label="`${expand ? 'Keep' : 'Close'} other rows`"></v-switch>
    <v-btn color="primary" dark v-on:click="getStations">Refresh</v-btn>
    </v-toolbar>
    <div class="mobi-table">  
      <v-data-table
        :headers="headers"
        :items="stations"
        :expand="expand"
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
              borderRadius: '25px',
            }" 
            @click="props.expanded = !props.expanded"
          >
            <td class="text-xs-left">{{ props.item.station_id }}</td>
            <td class="text-xs-left">{{ props.item.name }}</td>
            <td class="text-xs-left">{{ props.item.total_slots }}</td>
            <td class="text-xs-left">{{ props.item.free_slots }}</td>
            <td class="text-xs-left">{{ props.item.bike_inventory }}</td>
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
        { text: 'ID', value: 'stationId' },
        { text: 'Station Name', value: 'name' },
        { text: 'Total Slots',   value: 'total_slots' },
        { text: 'Free Slots',   value: 'free_slots' },
        { text: 'Available Bikes',  value: 'avl_bikes' },
      ],
      stations: [],
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
            //this.stations = this.getPercentages(response.data);
            //console.log(this.stations[0]);

            console.log(response.stations);
            console.log(response.status);
            console.log(response.statusText);


            if (response.data != null)
              this.stations = this.processStations(response.data);
            else
              console.log('failure to fetch data');
        })
    },
    //Calculates percentages and adds bikes/total slots property
    processStations(stations) {
      for (let station of stations) {
        station.percent_full = station.avl_bikes / station.total_slots * 100;
        station.bike_inventory = station.avl_bikes + ' / ' + station.total_slots;
        station.station_id = station.name.slice(0,4);
        station.name = station.name.slice(5);
      }
      return stations;
    },
  }
}
</script>

<style scoped>
tr {
  background-image: linear-gradient(to right, rgba(15, 85, 125, 0.66) 0%, rgba(20, 95, 145, 0.60) 15%, rgba(25, 85, 125, 0.68) 55%);
  background-repeat: no-repeat;
  border-radius: 25px;
  padding: 5px;
  text-shadow: currentColor;
}
td {
  background-image: none !important;
  font-size: 15px;
  text-shadow: currentColor;
}
.mobi-table .mobi-stationlist {
  background-image: linear-gradient(to top, rgba(0, 138, 190, 0.5) 0%, rgba(0, 138, 190, 0.65) 100%);
  padding: 8px;
  text-shadow: currentColor;
}
v-switch {
  vertical-align: 
}
h3 {
}
ul {
}
li {
}
a {
  color: #42b983;
}
</style>