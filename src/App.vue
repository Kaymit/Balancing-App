<template>
  <div id="app">
    <v-app>
      <StationList msg="This is a list of mobi stations"/>
    </v-app>
  </div>
</template>

<script>
import StationList from './components/StationList.vue'
export default {
  name: 'app',
  components: {
    StationList
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
