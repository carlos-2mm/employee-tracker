
const mysql = require("mysql2");
const inquirer = require("inquirer");

function collectInput() {
  const questions = [
    {
      type: "list",
      name: "text",
      message: "What would you like to do?",
      choices: [
        "View All Departments",
        "View All Roles",
        "View All Employees",
        "Add A Department",
        "Add A Role",
        "Add An Employee",
        "Update An Employee Role",
      ],
    },
  ];
  return inquirer.prompt(questions);
}

collectInput();