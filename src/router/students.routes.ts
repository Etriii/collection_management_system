import { StudentsPage } from '@pages/index.ts'
// import StudentDetails from '@/pages/StudentDetails.vue'
// import StudentEdit from '@/pages/StudentEdit.vue'
import StudentView2 from '@pages/students/presentation/components/StudentView2.vue'

export default [
    {

        path: '/students',
        children: [
            {
                path: '', 
                name: 'students',
                component: StudentsPage,
                meta: { pageTitle: 'Students' },
            },
            {
                path: ':id', 
                name: 'student-details',
                component: StudentView2,
                meta: { pageTitle: 'Student Details' },
            }
        ]
    }
]