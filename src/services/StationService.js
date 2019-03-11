import Api from '@/services/Api'

export default {
  fetchStations () {
    return Api().get('stations')
  }
}