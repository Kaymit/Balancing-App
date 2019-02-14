<template>
  <div>
    <v-toolbar flat color="white">
    <v-toolbar-title>Mobi Stations</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn color="primary" dark @click="expand = !expand">
      {{ expand ? 'Close' : 'Keep' }} other rows
    </v-btn>
    <v-btn color="primary" dark v-on:click="getStations">Refresh</v-btn>
    </v-toolbar>  
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
          }" 
          @click="props.expanded = !props.expanded"
        >
          <td class="text-xs-left">{{ props.item.stationId }}</td>
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
      //may need to be replaced when hosted
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
        station.stationId = station.name.slice(0,4);
        station.name = station.name.slice(5);
      }
      return stations;
    },
  }
}
</script>

<style scoped>
tr {
  background-image: linear-gradient(to top, rgba(0, 95, 145, 0.6) 0%, rgba(0, 130, 185, 0.8) 100%);
}
td {

}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>