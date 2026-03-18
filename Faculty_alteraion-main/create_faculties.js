/**
 * Bulk Faculty Creation Script
 * Run: node create_faculties.js
 * Creates login accounts for all new faculty members via the FacultySync API.
 */

const faculties = [
    {
        id: 'kiruthika@mkce.ac.in',
        password: 'mkce@1234',
        name: 'Ms. G. Kiruthika',
        dept: 'ECE',
        desig: 'Assistant Professor',
        phone: '',
        timetable: {}
    },
    {
        id: 'saranya@mkce.ac.in',
        password: 'mkce@1234',
        name: 'Mrs. M. Saranya',
        dept: 'ECE',
        desig: 'Assistant Professor',
        phone: '',
        timetable: {}
    },
    {
        id: 'sivakumar@mkce.ac.in',
        password: 'mkce@1234',
        name: 'Mr. T. Siva Kumar',
        dept: 'ECE',
        desig: 'Assistant Professor',
        phone: '',
        timetable: {}
    },
    {
        id: 'senthamilselvi@mkce.ac.in',
        password: 'mkce@1234',
        name: 'Mrs. M. Senthamilselvi',
        dept: 'ECE',
        desig: 'Assistant Professor',
        phone: '',
        timetable: {}
    },
    {
        id: 'ramesh@mkce.ac.in',
        password: 'mkce@1234',
        name: 'Mr. L. Ramesh',
        dept: 'ECE',
        desig: 'Assistant Professor',
        phone: '',
        timetable: {}
    },
    {
        id: 'revathi@mkce.ac.in',
        password: 'mkce@1234',
        name: 'Dr. G. Revathi',
        dept: 'ECE',
        desig: 'Assistant Professor',
        phone: '',
        timetable: {}
    },
    {
        id: 'jeyakumar@mkce.ac.in',
        password: 'mkce@1234',
        name: 'Dr. P. Jeyakumar',
        dept: 'ECE',
        desig: 'Assistant Professor',
        phone: '',
        timetable: {}
    },
    {
        id: 'sheikdavood@mkce.ac.in',
        password: 'mkce@1234',
        name: 'Dr. K. Sheikdavood',
        dept: 'ECE',
        desig: 'Assistant Professor',
        phone: '',
        timetable: {}
    },
    {
        id: 'sivaranjani@mkce.ac.in',
        password: 'mkce@1234',
        name: 'Dr. S. Sivaranjani',
        dept: 'ECE',
        desig: 'Assistant Professor',
        phone: '',
        timetable: {}
    },
    {
        id: 'sivagurunathan@mkce.ac.in',
        password: 'mkce@1234',
        name: 'Dr. P. T. Sivagurunathan',
        dept: 'ECE',
        desig: 'Assistant Professor',
        phone: '',
        timetable: {}
    },
    {
        id: 'sridevi@mkce.ac.in',
        password: 'mkce@1234',
        name: 'Dr. A. Sridevi',
        dept: 'ECE',
        desig: 'Professor',
        phone: '',
        timetable: {}
    }
];

async function createFaculties() {
    console.log('Creating faculty accounts...\n');
    let success = 0;
    let failed = 0;

    for (const faculty of faculties) {
        try {
            const res = await fetch('http://localhost:5000/api/profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(faculty)
            });
            const data = await res.json();
            if (data.success) {
                console.log(`✅ Created: ${faculty.name} (${faculty.id})`);
                success++;
            } else {
                console.log(`❌ Failed: ${faculty.name} — ${JSON.stringify(data)}`);
                failed++;
            }
        } catch (e) {
            console.log(`❌ Error creating ${faculty.name}: ${e.message}`);
            failed++;
        }
    }

    console.log(`\n✅ ${success} accounts created successfully.`);
    if (failed > 0) console.log(`❌ ${failed} failed.`);
    console.log('\nDefault password for all accounts: mkce@1234');
    console.log('IDs follow pattern: firstname@mkce.ac.in');
}

createFaculties();
