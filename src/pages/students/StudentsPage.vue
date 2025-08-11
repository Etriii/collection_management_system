<script setup lang="ts">
import Container from '@components/common/Container.vue';
import DataTable from '@components/tables/DataTable.vue';

const columns = [
    {name: 'student_id', title: 'Student ID'},
    {name: 'name', title: 'Fullname'},
    {name: 'name', title: 'Program/Year/Set'},
    {name: 'name', title: 'Status'},
]

const testData = [
    {id: 1, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 2, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 3, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 4, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
    {id: 5, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'ENROLLED'},
]
</script>

<template>
    <Container>
        <p class="text-xl font-medium mb-4">Students</p>

        <DataTable :columns="columns" :data="testData" />
    </Container>
    
</template>