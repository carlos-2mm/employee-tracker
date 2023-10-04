const inquirer = require("inquirer");
const cTable = require("console.table");

const {
  viewAllDepartments,
  viewAllRoles,
  viewAllEmployees,
  addDepartment,
  addRole,
  addEmployee,
  updateEmployeeRole,
  updateEmployeeManager,
  viewByManager,
  viewByDepartment,
  deleteDepartment,
  deleteRole,
  deleteEmployee,
  viewBudget,
} = require("./db/queries");

async function collectInput() {
  try {
    const response = await inquirer.prompt([
      {
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "View employees by manager",
          "View employees by department",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Update an employee role",
          "Update an employee manager",
          "Delete department",
          "Delete role",
          "Delete employee",
          "View utilized budget by department",
          "Exit",
        ],
      },
    ]);

    switch (response.action) {
      case "View all departments":
        await viewAllDepartments();
        break;
      case "View all roles":
        await viewAllRoles();
        break;
      case "View all employees":
        await viewAllEmployees();
        break;
      case "Add a department":
        await addDepartment();
        break;
      case "Add a role":
        await addRole();
        break;
      case "Add an employee":
        await addEmployee();
        break;
      case "Update an employee role":
        await updateEmployeeRole();
        break;
      case "Update an employee manager":
        await updateEmployeeManager();
        break;
      case "View employees by manager":
        await viewByManager();
        break;
      case "View employees by department":
        await viewByDepartment();
        break;
      case "Delete department":
        await deleteDepartment();
        break;
      case "Delete role":
        await deleteRole();
        break;
      case "Delete employee":
        await deleteEmployee();
        break;
      case "View utilized budget by department":
        await viewBudget();
        break;
      case "Exit":
        console.log("Goodbye!");
        process.exit(0);
        return;
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
  collectInput();
}

collectInput();
