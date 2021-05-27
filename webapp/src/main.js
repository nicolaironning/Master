import '@fortawesome/fontawesome-free/css/all.min.css'
import 'bootstrap-css-only/css/bootstrap.min.css'
import 'mdbvue/lib/css/mdb.min.css'
import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import VueWorker from 'vue-worker'

Vue.use(VueWorker)

Vue.config.productionTip = false

const { create, all } = require('mathjs')
const turf = require('turf')
const config = {
  number:'BigNumber',
  precision:20
}
Vue.prototype.$math = create(all,config)
Vue.prototype.$turf = turf

Vue.prototype.$idb = {
  SimpleIDB: {
    initialized: false,
    initialize() {
      var self = this;
      return new Promise((resolve, reject) => {
        // This first deletes any database of the same name
        let dRequest = indexedDB.deleteDatabase('devicedb')
        dRequest.onerror = function() {
          reject(dRequest.error)
        }
        // Then creates a new one
        let request = indexedDB.open('devicedb')
        request.onupgradeneeded = function() {
          request.result.createObjectStore('devicestore');
          self.initialized = true;
          resolve();
        }
        request.onerror = function() {
          reject(request.error)
        }
      })
    },

    get(key) {
      return new Promise((resolve, reject) => {
        let oRequest = indexedDB.open('devicedb')
        oRequest.onsuccess = function() {
          let db = oRequest.result

          // Resolve null if no stores exists
          if(db.objectStoreNames.length == 0) {
            resolve(null);
          } else {
            let tx = db.transaction('devicestore', 'readonly')
            let st = tx.objectStore('devicestore')
            let gRequest = st.get(key)
            gRequest.onsuccess = function() {
              resolve(gRequest.result)
            }
            gRequest.onerror = function() {
              reject(gRequest.error)
            }
          }
        }
        oRequest.onerror = function() {
          reject(oRequest.error)
        }
      })
    },

    set(key, value) {
      return new Promise((resolve, reject) => {
        let oRequest = indexedDB.open('devicedb')
        oRequest.onsuccess = function() {
          let db = oRequest.result
          let tx = db.transaction('devicestore', 'readwrite')
          let st = tx.objectStore('devicestore')
          let sRequest = st.put(value, key)
          sRequest.onsuccess = function() {
            resolve()
          }
          sRequest.onerror = function() {
            reject(sRequest.error)
          }
        }
        oRequest.onerror = function() {
          reject(oRequest.error)
        }
      })
    },

    remove(key) {
      return new Promise((resolve, reject) => {
        let oRequest = indexedDB.open('devicedb')
        oRequest.onsuccess = function() {
          let db = oRequest.result
          let tx = db.transaction('devicestore', 'readwrite')
          let st = tx.objectStore('devicestore')
          let rRequest = st.delete(key)
          rRequest.onsuccess = function() {
            resolve()
          }
          rRequest.onerror = function() {
            reject(rRequest.error)
          }
        }
        oRequest.onerror = function() {
          reject(oRequest.error)
        }
      })
    }
  }
}


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
