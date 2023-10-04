const inquirer = require('inquirer');
const cTable = require('console.table');
const {
    viewAllDepartments,
    viewAllRoles,
    viewAllEmployees,
    addDepartment,
    addRole,
    addEmployee,
    updateEmployeeRole
} = require('./db/queries');

async function collectInput() {
    try {
        const response = await inquirer.prompt([
            {
                name: 'action',
                type: 'list',
                message: 'What would you like to do?',
                choices: [
                    'View all departments',
                    'View all roles',
                    'View all employees',
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    'Update an employee role',
                    'Exit'
                ]
            }
        ]);

        switch (response.action) {
            case 'View all departments':
                await viewAllDepartments(collectInput);
                break;
            case 'View all roles':
                await viewAllRoles(collectInput);
                break;
            case 'View all employees':
                await viewAllEmployees(collectInput);
                break;
            case 'Add a department':
                await addDepartment(collectInput);
                break;
            case 'Add a role':
                await addRole(collectInput);
                break;
            case 'Add an employee':
                await addEmployee(collectInput);
                break;
            case 'Update an employee role':
                await updateEmployeeRole(collectInput);
                break;
            case 'Exit':
                process.exit();
                break;
        }
        collectInput();
    } catch (error) {
        console.error('An error occurred:', error);
        collectInput();
    }
}

collectInput();