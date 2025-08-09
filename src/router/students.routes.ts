import {StudentsPage} from '@pages/index.ts'
// import StudentDetails from '@/pages/StudentDetails.vue'
// import StudentEdit from '@/pages/StudentEdit.vue'

export default [
    {
        path: '/students',
        name: 'students',
        component: StudentsPage,
        meta: { pageTitle: 'Students' },

        // If ever need og mga childrens para ma save ang state sa parent

        // children: [
        //     {
        //         path: ':id',
        //         name: 'student-details',
        //         component: StudentDetails,
        //         meta: { pageTitle: 'Student Details' }
        //     },
        //     {
        //         path: ':id/edit',
        //         name: 'student-edit',
        //         component: StudentEdit,
        //         meta: { pageTitle: 'Edit Student' }
        //     }
        // ]
    }
]
