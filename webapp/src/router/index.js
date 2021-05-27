import Vue from "vue";
import Router from "vue-router";

import Dashboard from "@/components/Dashboard"
import Demo from "@/components/Demo"
import Devices from "@/components/Devices"
import FilterMap from "@/components/FilterMap"
import Compare from "@/components/Compare"
import Upload from "@/components/Upload"

Vue.use(Router);
Vue.use(Dashboard);
Vue.use(Demo);
Vue.use(Devices);
Vue.use(FilterMap);
Vue.use(Compare);
Vue.use(Upload);

export default new Router({
  routes: [
    {
      path: "/",
      name: "Home",
      redirect: "Dashboard"
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: Dashboard
    },
    {
      path: "/demo",
      name: "Demo",
      component: Demo
    },
    {
      path: "/devices",
      name: "Devices",
      component: Devices
    },
    {
      path: "/map",
      name: "Map",
      component: FilterMap
    },
    {
      path: "/compare",
      name: "Compare",
      component: Compare
    },
    {
      path: "/upload",
      name: "Upload",
      component: Upload
    }
  ]
});