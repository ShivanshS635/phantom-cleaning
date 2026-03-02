const mongoose = require('mongoose');
const Salary = require('./models/Salary');
const Employee = require('./models/Employee');
const dotenv = require('dotenv');

dotenv.config({ path: './server/.env' });

async function testSalaryModule() {
    try {
        console.log('--- Starting Salary Module Verification ---');

        // Connect to DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Get an active employee
        const employee = await Employee.findOne({ status: 'Active' });
        if (!employee) {
            throw new Error('No active employee found for testing');
        }
        console.log(`✅ Using employee: ${employee.name}`);

        // 2. Clear existing test data for this week
        const weekNum = 10;
        const year = 2026;
        await Salary.deleteMany({ employee: employee._id, weekNumber: weekNum, year: year });

        // 3. Create a salary record
        const salary = await Salary.create({
            employee: employee._id,
            state: employee.state,
            weekStartDate: new Date(2026, 2, 2),
            weekEndDate: new Date(2026, 2, 8),
            year: year,
            weekNumber: weekNum,
            baseSalary: 1000,
            bonuses: [{ description: 'Performance', amount: 100 }],
            deductions: [{ description: 'Insurance', amount: 50 }],
            totalAmount: 1050,
            status: 'Paid',
            paymentMethod: 'Bank Transfer'
        });
        console.log('✅ Salary record created successfully');

        // 4. Test Duplicate Restriction
        try {
            await Salary.create({
                employee: employee._id,
                state: employee.state,
                weekStartDate: new Date(2026, 2, 2),
                weekEndDate: new Date(2026, 2, 8),
                year: year,
                weekNumber: weekNum,
                baseSalary: 1000,
                totalAmount: 1000
            });
            console.log('❌ Error: Duplicate salary allowed!');
        } catch (err) {
            console.log('✅ Duplicate salary restricted (Correct behavior)');
        }

        console.log('--- Verification Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Verification failed:', err);
        process.exit(1);
    }
}

testSalaryModule();
