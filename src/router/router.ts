import { createRouter, createWebHistory } from "vue-router";//createWebHashHistory, 
import type { RouteRecordRaw } from 'vue-router'

import AuthenticatedLayout from "@layouts/AuthenticatedLayout.vue";

import { Dashboard, Transactions, GCashPayments, Collections, Reports, Users, Activities, MyAccount, AdminManager, Login, AccountRecovery, PageNotFound, AccountRecoveryConfirmaion, Fees, GeneratedFees, ViewStudent, Unauthorized, MyTransactions, MyGcashPayments } from '@pages/index.ts';

import { StudentRoutes } from './index';
import LogInSignupLayout from "@layouts/LogInSignupLayout.vue";
import { useAuthStore } from "@pages/auth/presentation/stores/useAuthStore";
import { useAuth } from "@pages/auth/presentation/composables/useAuth";
import { Roles } from "@core/constants";
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
                meta: { pageTitle: 'Dashboard', roles: [Roles.STUDENT, Roles.ADMIN, Roles.STAFF] }
            },
            ...StudentRoutes,
            {
                path: 'fees',
                name: 'fees',
                component: Fees,
                meta: { pageTitle: 'Fees', roles: [Roles.STUDENT, Roles.ADMIN, Roles.STAFF] }
            },
            {
                path: 'generated-fees',
                name: 'geneated-fees',
                component: GeneratedFees,
                meta: { pageTitle: 'Generated Fees', roles: [Roles.ADMIN, Roles.STAFF] }
            },
            {
                path: 'transactions',
                name: 'transactions',
                component: Transactions,
                meta: { pageTitle: 'Transactions', roles: [Roles.ADMIN, Roles.STAFF] }
            },
            {
                path: 'gcash-payments',
                name: 'gcash-payments',
                component: GCashPayments,
                meta: { pageTitle: 'Gcash Payments', roles: [Roles.ADMIN, Roles.STAFF] }
            },
            {
                path: 'collections',
                name: 'collections',
                component: Collections,
                meta: { pageTitle: 'Collections', roles: [Roles.ADMIN] }
            },
            {
                path: 'users',
                name: 'users',
                component: Users,
                meta: { pageTitle: 'Users', roles: [Roles.ADMIN] }
            },
            {
                path: 'reports',
                name: 'reports',
                component: Reports,
                meta: { pageTitle: 'Reports', roles: [Roles.ADMIN, Roles.STAFF] }
            },
            {
                path: 'activities',
                name: 'activities',
                component: Activities,
                meta: { pageTitle: 'Activities', roles: [Roles.ADMIN] }
            }, {
                path: 'my-account',
                name: 'My account',
                component: MyAccount,
                meta: { pageTitle: 'My account' },
            },
            {
                path: 'admin-manager',
                name: 'Admin Manager',
                component: AdminManager,
                meta: { pageTitle: 'Admin manager', roles: [Roles.ADMIN] }
            },
            {
                path: '/students/view/:id',
                name: 'ViewStudent',
                component: ViewStudent,
                meta: { pageTitle: 'Reports', roles: [Roles.ADMIN, Roles.STAFF] }

            }, {
                path: 'my-transactions',
                name: 'Transcations',
                component: MyTransactions,
                meta: { pageTitle: 'My Transactions', roles: [Roles.STUDENT] }
            },
            {
                path: 'my-gcash-payments',
                name: 'Gcash Payments',
                component: MyGcashPayments,
                meta: { pageTitle: 'Gcash Payments', roles: [Roles.STUDENT] }
            },
        ]
    },
    {
        path: '/unauthorized',
        component: Unauthorized,
        meta: { requiresAuth: true },
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
            },
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
    const { user } = useAuth();
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

    const allowedRoles = to.meta.roles as string[] | undefined
    if (allowedRoles && user.value?.groups) {
        const hasAccess = user.value.groups.some((role: string) =>
            allowedRoles.includes(role)
        )
        if (!hasAccess) {
            return next("/unauthorized")
        }
    }

    next();
});



export default router;