export interface FeeFilter{
    student_id:number,
    academic_year: '2025-2026' | '2026-2027',
    semester: '1st' | '2nd',
    status: 'pending'| 'paid'| 'waived'| 'partial',
    program_name: string,
    category_name: string, //replace ni og choices sa collection category banda
}


