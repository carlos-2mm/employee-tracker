const inquirer = require("inquirer");
const queries = require("./db/queries");

async function collectInput() {
  const { action } = await inquirer.prompt({
    type: "list",
    name: "action",
    message: "What would you like to do?",
    choices: [
      "View all departments",
      "View all roles",
      "View all employees",
      "Add a department",
      "Add a role",
      "Add an employee",
      "Update an employee role",
      "Exit",
    ],
  });

  switch (action) {
        case 'View all departments':
            const departments = await queries.getAllDepartments();
            console.table(departments);
            break;
        case 'View all roles':
            const roles = await queries.getAllRoles();
            console.table(roles);
            break;
        case 'View all employees':
            const employees = await queries.getAllEmployees();
            console.table(employees);
            break;
  }

    collectInput();
}

collectInput();