import { createRouter, createWebHistory } from "vue-router";//createWebHashHistory, 
import type { RouteRecordRaw } from 'vue-router'

import AuthenticatedLayout from "@layouts/AuthenticatedLayout.vue";

import { Dashboard, Transactions, GCashPayments, Collections, Reports, Users, Activities, MyAccount, AdminManager, Login, AccountRecovery, PageNotFound } from '@pages/index.ts';

import { StudentRoutes } from './index';
import LogInSignupLayout from "@layouts/LogInSignupLayout.vue";

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
                path: '',
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
                meta: { pageTitle: 'Collections' },
            },
            {
                path: 'users',
                name: 'users',
                component: Users,
                meta: { pageTitle: 'Users' },
            },
            {
                path: 'reports',
                name: 'reports',
                component: Reports,
                meta: { pageTitle: 'Reports' },
            },
            {
                path: 'activities',
                name: 'activities',
                component: Activities,
                meta: { pageTitle: 'Activities' },
            },
            {
                path: 'my-account',
                name: 'My account',
                component: MyAccount,
                meta: { pageTitle: 'My account' },
            },
            {
                path: 'admin-manager',
                name: 'Admin Manager',
                component: AdminManager,
                meta: { pageTitle: 'Admin manager' },
            },
        ]
    },
    {
        path: '/',
        component: LogInSignupLayout,
        children: [
            {
                path: 'login',
                name: 'Log In | CMS',
                component: Login,
                meta: { pageTitle: 'Dashboard' }
            },
            {
                path: 'account-recovery',
                name: 'Account Recovery',
                component: AccountRecovery,
                meta: { pageTitle: 'AccountRecovery' }
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: PageNotFound
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
});

export default router;