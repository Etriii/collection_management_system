import { createRouter, createWebHistory } from "vue-router";//createWebHashHistory, 
import type { RouteRecordRaw } from 'vue-router'

import AuthenticatedLayout from "@layouts/AuthenticatedLayout.vue";

import { Dashboard, Transactions, GCashPayments, Collections, Reports, Users, Activities, MyAccount, AdminManager, Login, AccountRecovery, PageNotFound, AccountRecoveryConfirmaion, Fees, GeneratedFees } from '@pages/index.ts';

import { StudentRoutes } from './index';
import LogInSignupLayout from "@layouts/LogInSignupLayout.vue";
import { useAuthStore } from "@pages/auth/presentation/stores/useAuthStore";

/* search the difference between 
createWebHistory and createWebHashHistory
*/

// meta - to be used in the Navbar pagTitle

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: AuthenticatedLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'dashboard',
                component: Dashboard,
                meta: { pageTitle: 'Dashboard' }
            },
            ...StudentRoutes,
            {
                path: 'fees',
                name: 'fees',
                component: Fees,
                meta: { pageTitle: 'Fees' }
            },
            {
                path: 'generated-fees',
                name: 'geneated-fees',
                component: GeneratedFees,
                meta: { pageTitle: 'Generated Fees' }
            },
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
                meta: { pageTitle: 'Gcash Payments' },
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
        path: '/auth',
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
            },
            {
                path: 'account-recovery/confirmation',
                name: 'Account Recovery Confirmation',
                component: AccountRecoveryConfirmaion,
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

router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore();

    if (!authStore.initialized) {
        await authStore.initialize();
    }

    const isLoggedIn = !!authStore.user;

    if (to.meta.requiresAuth && !isLoggedIn) {
        return next("/auth/login");
    }

    if (to.path.startsWith("/auth") && isLoggedIn) {
        return next("/");
    }

    next();
});



export default router;