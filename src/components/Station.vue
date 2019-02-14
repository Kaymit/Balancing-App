<template>
  <div class="station">
    <p>{{station.name}}</p>
  </div>
</template>

<script>
export default {
  name: 'Station',
  props: {
    station: Object
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>