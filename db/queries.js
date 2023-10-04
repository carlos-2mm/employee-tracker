const db = require("../config/connection");
const inquirer = require("inquirer");

async function viewAllDepartments() {
  try {
    const sql = `SELECT * FROM departments ORDER BY name ASC`;
    const [dept] = await db.promise().query(sql);

    if (dept.length === 0) {
      console.log("No departments to display.");
      return;
    }

    console.table("\n", dept);
  } catch (error) {
    console.error("Failed to retrieve departments from the database.", error);
  }
}

async function viewAllRoles() {
  try {
    const sql = `SELECT rol.title 'Job title', rol.id 'Job ID', dep.name 'Department', dep.id 'Department ID', rol.salary 'Salary'
              FROM roles rol
              LEFT JOIN departments dep ON rol.department_id = dep.id
              ORDER BY rol.title ASC;`;

    const [role] = await db.promise().query(sql);

    if (role.length === 0) {
      console.log("No roles to display.");
      return;
    }

    console.table("\n", role);
  } catch (error) {
    console.error("Failed to retrieve roles from the database.", error);
  }
}

async function viewAllEmployees() {
  try {
    const sql = `SELECT e.id 'Employee ID', CONCAT(e.first_name, ' ', e.last_name) 'Employee', rol.title 'Title', dep.name 'Department', rol.salary 'Salary', CONCAT(m.first_name, ' ', m.last_name) manager
                      FROM employees e
                      LEFT JOIN employees m ON e.manager_id = m.id
                      JOIN roles rol ON e.role_id = rol.id
                      JOIN departments dep ON dep.id = rol.department_id
                      ORDER BY e.first_name ASC;`;

    const [results] = await db.promise().query(sql);

    if (results.length === 0) {
      console.log("No employees to display.");
      return;
    }

    console.table("\n", results);
  } catch (error) {
    console.error("Failed to retrieve employees from the database.", error);
  }
}

async function addDepartment() {
  try {
    const { newDepartment } = await inquirer.prompt([
      {
        name: "newDepartment",
        type: "input",
        message: "What is the department you want to add?",
      },
    ]);

    if (!newDepartment || newDepartment.trim() === "") {
      console.log("You must provide a valid department name.");
      return;
    }

    const sql = `INSERT INTO departments (name) VALUES(?)`;
    const [res] = await db.promise().query(sql, [newDepartment]);

    if (res.affectedRows !== 1) {
      console.log("Failed to add the department.");
      return;
    }

    console.log(`\nDepartment added successfully with id: ${res.insertId}.\n`);
  } catch (error) {
    console.error("Error while adding a new department:", error);
  }
}

async function addRole() {
  try {
    const [departments] = await db
      .promise()
      .query(`SELECT name FROM departments`);
    const departmentChoices = departments.map((dept) => dept.name);

    const { newRole, salary, departmentName } = await inquirer.prompt([
      {
        name: "newRole",
        type: "input",
        message: "What is the role you want to add?",
      },
      {
        name: "salary",
        type: "number",
        message: "What is the associated salary?",
        validate: (value) => !isNaN(value) || "Please enter a valid number.",
      },
      {
        name: "departmentName",
        type: "rawlist",
        message: "Which department should the role be associated with?",
        choices: departmentChoices,
      },
    ]);

    const [dept] = await db
      .promise()
      .query(`SELECT id FROM departments WHERE name = ?`, [departmentName]);
    const deptID = dept[0].id;

    const sql = `INSERT INTO roles (title, salary, department_id) VALUES(?,?,?)`;
    const [res] = await db.promise().query(sql, [newRole, salary, deptID]);

    if (res.affectedRows !== 1) {
      console.log("Failed to add the role.");
      return;
    }

    console.log(`\nRole added successfully with id: ${res.insertId}.\n`);
  } catch (error) {
    console.error("Error while adding a new role:", error);
  }
}

async function addEmployee() {
  try {
    let [rolesList] = await db.promise().query(`SELECT id, title FROM roles`);
    let [employeesList] = await db
      .promise()
      .query(
        `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees`
      );

    const roleChoices = rolesList.map((role) => role.title);
    const employeeChoices = employeesList.map((emp) => emp.name);

    const { firstName, lastName, role, manager } = await inquirer.prompt([
      {
        name: "firstName",
        type: "input",
        message: "What is the first name of the new employee?",
      },
      {
        name: "lastName",
        type: "input",
        message: "What is the last name of the new employee?",
      },
      {
        name: "role",
        type: "rawlist",
        message: "What is the role of the new employee?",
        choices: roleChoices,
      },
      {
        name: "manager",
        type: "rawlist",
        message: "Who will manage the new employee?",
        choices: employeeChoices,
      },
    ]);

    const selectedRole = rolesList.find((r) => r.title === role);
    const selectedManager = employeesList.find((e) => e.name === manager);

    const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES(?,?,?,?)`;
    let [res] = await db
      .promise()
      .query(sql, [firstName, lastName, selectedRole.id, selectedManager.id]);

    if (res.warningStatus !== 0 || res.affectedRows !== 1) {
      console.log("An error occurred.");
      return;
    }

    console.log(
      `\nSuccessfully added entry - employee id: ${res.insertId}.\nAdded ${res.affectedRows} row.\n`
    );
  } catch (error) {
    console.error("Error adding employee:", error);
  }
}

async function updateEmployeeRole() {
  try {
    const rolesResponse = await db.promise().query(`SELECT * FROM roles;`);
    const roles = rolesResponse[0].map((role) => ({
      name: role.title,
      id: role.id,
    }));

    const employeesResponse = await db
      .promise()
      .query(`SELECT * FROM employees;`);
    const employees = employeesResponse[0].map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      id: employee.id,
    }));

    const { employeeName, newRoleName } = await inquirer.prompt([
      {
        name: "employeeName",
        pageSize: 1000,
        type: "rawlist",
        message: "Which employee should be updated?",
        choices: employees.map((e) => e.name),
      },
      {
        name: "newRoleName",
        pageSize: 1000,
        type: "rawlist",
        message: "What should be the new role of the employee?",
        choices: roles.map((r) => r.name),
      },
    ]);

    const selectedEmployee = employees.find((e) => e.name === employeeName);
    const selectedRole = roles.find((r) => r.name === newRoleName);

    const sql = `UPDATE employees SET role_id = ? WHERE id = ?`;
    let [res] = await db
      .promise()
      .query(sql, [selectedRole.id, selectedEmployee.id]);

    if (res.warningStatus !== 0 || res.affectedRows !== 1) {
      console.log("An error occurred.");
      return;
    }

    console.log(`\nSuccessfully updated ${res.changedRows} entry.\n`);
  } catch (error) {
    console.error("Error updating employee role:", error);
  }
}

module.exports = {
  viewAllDepartments,
  viewAllRoles,
  viewAllEmployees,
  addDepartment,
  addRole,
  addEmployee,
  updateEmployeeRole,
};
