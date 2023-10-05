// Import necessary modules
const inquirer = require("inquirer");
const cTable = require("console.table");

// Import database query functions
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

// Function to collect user input and execute corresponding actions
async function collectInput() {
  try {
    // Prompt user for action
    const response = await inquirer.prompt([
      {
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
          // List of actions user can choose from
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

    // Switch case to handle user's action choice
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
        // Exit the application
        console.log("Goodbye!");
        process.exit(0);
        return;
    }
  } catch (error) {
    // Log any errors that occur
    console.error("An error occurred:", error);
  }
  // Recursive call to keep the application running until "Exit" is chosen
  collectInput();
}

// Initial call to start the application
collectInput();
