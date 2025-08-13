 <script setup lang="ts">
import Container from '@components/common/Container.vue';
import DataTable from '@components/tables/DataTable.vue';
import { ref } from 'vue';

// headers for the datatable
const headers = [
    {name: 'id', title: '#'},
    {name: 'student_id', title: 'Student ID'},
    {name: 'fullname', title: 'Fullname'},
    {name: 'set', title: 'Program/Year/Set'},
    {name: 'status', title: 'Status'},
]

const dummyURL = 'localhost:8000//api/students/'

const fetchStudents = () => {
    // fetch students data
}

/*
the fields and methods below are needed it's because,
we need the values nga gikan sa mga child components sa datatable.
since nag use ug pagination atong backend, so it makes sense na
need nato ug data from the datatable
*/

const currentPage = ref(1);
const perPage = ref(10);

// handels pagination page ex. 1, 2, 3, ...
const handlePageChange = (page: number) => {
    currentPage.value = page;
    // fetch student data
}

const handlePerPageChange = (count: number) => {
    perPage.value = count;
    currentPage.value = 1; // reset to first page
    //  fetch students here

    console.log(count);
}

// test data only
const testData = [
    {id: 1, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 2, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 3, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 4, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 5, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 6, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 7, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 8, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 9, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 10, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 11, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 12, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 13, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 14, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 15, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 16, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 17, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 18, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 19, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 20, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 21, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 22, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 23, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 24, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 25, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 26, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 27, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 28, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 29, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 30, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 31, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 32, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 33, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 34, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 35, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 36, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 37, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 38, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 39, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 40, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 41, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 42, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 43, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 44, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 45, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 46, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 47, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 48, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 49, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 50, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 51, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 52, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 53, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 54, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 55, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 56, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 57, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 58, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 59, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 60, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 61, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 62, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 63, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 64, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 65, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 66, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 67, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 68, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 69, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 70, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 71, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 72, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 73, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 74, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 75, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
     {id: 76, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 77, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 78, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 79, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 80, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 81, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 82, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 83, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 84, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 85, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
     {id: 86, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 87, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 88, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 89, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 90, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 91, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 92, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 93, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 94, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 95, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
     {id: 96, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 97, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 98, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 99, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 100, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
]
</script>

<template>
    <Container>
        <p class="text-xl font-medium mb-4">Students</p>

        <DataTable 
            :url="dummyURL"
            :headers="headers" 
            :data="testData"
            :perPage="perPage"
            :currentPage="currentPage"
            @pageChange="handlePageChange"
            @perPageChange="handlePerPageChange"
        />
    </Container>
    
</template>