import { createRouter, createWebHistory } from "vue-router";//createWebHashHistory, 
import type { RouteRecordRaw } from 'vue-router'

import AuthenticatedLayout from "@layouts/AuthenticatedLayout.vue";

import { Dashboard, Transactions, GCashPayments, Collections, Reports, Users, Activities, MyAccount, AdminManager } from '@pages/index.ts';

import { StudentRoutes } from './index';

/* search the difference between 
createWebHistory and createWebHashHistory
*/

// meta - to be used in the Navbar pagTitle

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: AuthenticatedLayout,
        children: [
            {
                path: '/',
                name: 'dashboard',
                component: Dashboard,
                meta: { pageTitle: 'Dashboard' }
            },
            ...StudentRoutes,
            {
                path: 'transactions',
                name: 'transactions',
                component: Transactions,
                meta: { pageTitle: 'Transactions' }
            },
            {
                path: 'gcash-payments',
                name: 'gcash-payments',
                component: GCashPayments,
                meta: { pageTitle: 'Transactions' },
            },
            {
                path: 'collections',
                name: 'collections',
                component: Collections,
                meta: { pageTitle: 'collections' },
            },
            {
                path: 'users',
                name: 'users',
                component: Users,
                meta: { pageTitle: 'users' },
            },
            {
                path: 'reports',
                name: 'reports',
                component: Reports,
                meta: { pageTitle: 'reports' },
            },
            {
                path: '/activities',
                name: 'activities',
                component: Activities,
                meta: { pageTitle: 'activities' },
            },
            {
                path: '/my-account',
                name: 'My account',
                component: MyAccount,
                meta: { pageTitle: 'My account' },
            },
            {
                path: '/admin-manager',
                name: 'Admin Manager',
                component: AdminManager,
                meta: { pageTitle: 'Admin manager' },
            },
        ]
    },
    {
        path: '/',
        component: AuthenticatedLayout,
        children: [
            {
                path: 'login',
                name: 'Log In | CMS',
                component: Dashboard,
                meta: { pageTitle: 'Dashboard' }
            },
            {
                path: '/transactions',
                name: 'transactions',
                component: Transactions,
                meta: { pageTitle: 'Transactions' }
            }
        ]
    },

]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
});

export default router;