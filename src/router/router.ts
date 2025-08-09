import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";

import Dashboard from "@pages/Dashboard.vue";
import StudentsPage from "@pages/StudentsPage.vue";

/* search the difference between 
createWebHistory and createWebHashHistory
*/

// meta - to be used in the Navbar pagTitle

const routes =  [
    {
        path: '/', 
        name: 'dashboard', 
        component: Dashboard,
        meta: { pageTitle: 'Dashboard' }
    },
    {
        path: '/students', 
        name: 'students', 
        component: StudentsPage,
        meta: { pageTitle: 'Students' }
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
});

export default router;