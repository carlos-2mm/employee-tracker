// Importing required modules
const db = require("../config/connection");  // Database connection configuration
const inquirer = require("inquirer");        // Module to interact with the user via CLI

// Display a list of all departments
async function viewAllDepartments() {
  try {
    const sql = `SELECT * FROM departments ORDER BY name ASC`;
    const [dept] = await db.promise().query(sql);

    if (dept.length === 0) {
      console.log("No departments to display.");
      return;
    }

    // Display departments in a tabular format
    console.table("\n", dept);
  } catch (error) {
    console.error("Failed to retrieve departments from the database.", error);
  }
}

// Display a list of all roles from the database
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

    // Display roles in a tabular format
    console.table("\n", role);
  } catch (error) {
    console.error("Failed to retrieve roles from the database.", error);
  }
}

// Display a list of all employees from the database
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

    // Display employees in a tabular format
    console.table("\n", results);
  } catch (error) {
    console.error("Failed to retrieve employees from the database.", error);
  }
}

// Add a new department to the database
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

// Add a new role to the database
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

// Add a new employee to the database
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

// Update the role of a selected employee
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

// Update the manager for a selected employee
async function updateEmployeeManager() {
  try {
    const employeesResponse = await db
      .promise()
      .query(`SELECT * FROM employees;`);
    const employees = employeesResponse[0].map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      id: employee.id,
    }));

    const { employeeName, newManagerName } = await inquirer.prompt([
      {
        name: "employeeName",
        pageSize: 1000,
        type: "rawlist",
        message: "Which employee's manager should be updated?",
        choices: employees.map((e) => e.name),
      },
      {
        name: "newManagerName",
        pageSize: 1000,
        type: "rawlist",
        message: "Who should be the new manager for this employee?",
        choices: [...employees.map((e) => e.name), "No Manager"],
      },
    ]);

    const selectedEmployee = employees.find((e) => e.name === employeeName);
    const selectedManager = employees.find((e) => e.name === newManagerName);

    const sql = `UPDATE employees SET manager_id = ? WHERE id = ?`;
    let [res] = await db
      .promise()
      .query(sql, [
        selectedManager ? selectedManager.id : null,
        selectedEmployee.id,
      ]);

    if (res.warningStatus !== 0 || res.affectedRows !== 1) {
      console.log("An error occurred.");
      return;
    }

    console.log(`\nSuccessfully updated ${res.changedRows} entry.\n`);
  } catch (error) {
    console.error("Error updating employee manager:", error);
  }
}

// Display employees based on their manager
async function viewByManager() {
  try {
    const managersSql = `SELECT DISTINCT m.id, CONCAT(m.first_name, ' ', m.last_name) as manager_name 
                         FROM employees m 
                         WHERE m.id IN (SELECT DISTINCT manager_id FROM employees WHERE manager_id IS NOT NULL);`;

    const [managers] = await db.promise().query(managersSql);

    const { managerId } = await inquirer.prompt([
      {
        name: "managerId",
        type: "list",
        message: "Select a manager to view their employees:",
        choices: managers.map((m) => ({
          name: m.manager_name,
          value: m.id,
        })),
      },
    ]);

    const sql = `SELECT e.id 'Employee ID', CONCAT(e.first_name, ' ', e.last_name) 'Employee', 
                        rol.title 'Title', dep.name 'Department', rol.salary 'Salary', 
                        CONCAT(m.first_name, ' ', m.last_name) manager
                 FROM employees e
                 LEFT JOIN employees m ON e.manager_id = m.id
                 JOIN roles rol ON e.role_id = rol.id
                 JOIN departments dep ON dep.id = rol.department_id
                 WHERE e.manager_id = ?
                 ORDER BY CONCAT(m.first_name, ' ', m.last_name), e.first_name ASC;`;

    const [results] = await db.promise().query(sql, [managerId]);

    if (results.length === 0) {
      console.log("No employees found for the selected manager.");
      return;
    }

    console.table("\n", results);
  } catch (error) {
    console.error(
      "Failed to retrieve employees by manager from the database.",
      error
    );
  }
}

// Display employees based on their department
async function viewByDepartment() {
  try {
    const departmentsSql = `SELECT id, name as department_name FROM departments;`;
    const [departments] = await db.promise().query(departmentsSql);

    if (!departments.length) {
      console.log("No departments found.");
      return;
    }

    const { departmentId } = await inquirer.prompt([
      {
        name: "departmentId",
        type: "list",
        message: "Select a department to view its employees:",
        choices: departments.map((d) => ({
          name: d.department_name,
          value: d.id,
        })),
      },
    ]);

    const sql = `SELECT e.id 'Employee ID', CONCAT(e.first_name, ' ', e.last_name) 'Employee', 
                          rol.title 'Title', dep.name 'Department', rol.salary 'Salary', 
                          CONCAT(m.first_name, ' ', m.last_name) manager
                   FROM employees e
                   LEFT JOIN employees m ON e.manager_id = m.id
                   JOIN roles rol ON e.role_id = rol.id
                   JOIN departments dep ON dep.id = rol.department_id
                   WHERE rol.department_id = ?
                   ORDER BY dep.name, e.first_name ASC;`;

    const [results] = await db.promise().query(sql, [departmentId]);

    if (!results.length) {
      console.log("No employees found for the selected department.");
      return;
    }

    console.table("\n", results);
  } catch (error) {
    console.error(
      "Failed to retrieve employees by department from the database.",
      error
    );
  }
}

// Deletes a department based on user selection
async function deleteDepartment() {
  try {
    const departmentsResponse = await db
      .promise()
      .query(`SELECT * FROM departments;`);
    const departments = departmentsResponse[0].map((department) => ({
      name: department.name,
      id: department.id,
    }));

    const { departmentToDelete } = await inquirer.prompt([
      {
        name: "departmentToDelete",
        type: "list",
        message: "Which department do you want to delete?",
        choices: departments.map((d) => d.name),
      },
    ]);

    const selectedDepartment = departments.find(
      (d) => d.name === departmentToDelete
    );

    if (!selectedDepartment) {
      console.log(`Department ${departmentToDelete} not found.`);
      return;
    }

    const sql = `DELETE FROM departments WHERE id = ?`;
    const [res] = await db.promise().query(sql, [selectedDepartment.id]);

    if (res.affectedRows !== 1) {
      console.log(`Failed to delete the department ${departmentToDelete}.`);
      return;
    }

    console.log(`\nDepartment ${departmentToDelete} deleted successfully.\n`);
  } catch (error) {
    console.error("Error while deleting the department:", error);
  }
}

// Deletes a role based on user selection
async function deleteRole() {
  try {
    const rolesResponse = await db.promise().query(`SELECT * FROM roles;`);
    const roles = rolesResponse[0].map((role) => ({
      name: role.title,
      id: role.id,
    }));

    const { roleToDelete } = await inquirer.prompt([
      {
        name: "roleToDelete",
        type: "list",
        message: "Which role do you want to delete?",
        choices: roles.map((r) => r.name),
      },
    ]);

    const selectedRole = roles.find((r) => r.name === roleToDelete);

    if (!selectedRole) {
      console.log(`Role ${roleToDelete} not found.`);
      return;
    }

    const sql = `DELETE FROM roles WHERE id = ?`;
    const [res] = await db.promise().query(sql, [selectedRole.id]);

    if (res.affectedRows !== 1) {
      console.log(`Failed to delete the role ${roleToDelete}.`);
      return;
    }

    console.log(`\nRole ${roleToDelete} deleted successfully.\n`);
  } catch (error) {
    console.error("Error while deleting the role:", error);
  }
}

// Deletes an employee based on user selection
async function deleteEmployee() {
  try {
    const employeesResponse = await db
      .promise()
      .query(`SELECT * FROM employees;`);
    const employees = employeesResponse[0].map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      id: employee.id,
    }));

    const { employeeToDelete } = await inquirer.prompt([
      {
        name: "employeeToDelete",
        type: "list",
        message: "Which employee do you want to delete?",
        choices: employees.map((e) => e.name),
      },
    ]);

    const selectedEmployee = employees.find((e) => e.name === employeeToDelete);

    if (!selectedEmployee) {
      console.log(`Employee ${employeeToDelete} not found.`);
      return;
    }

    const sql = `DELETE FROM employees WHERE id = ?`;
    const [res] = await db.promise().query(sql, [selectedEmployee.id]);

    if (res.affectedRows !== 1) {
      console.log(`Failed to delete the employee ${employeeToDelete}.`);
      return;
    }

    console.log(`\nEmployee ${employeeToDelete} deleted successfully.\n`);
  } catch (error) {
    console.error("Error while deleting the employee:", error);
  }
}

//Fetches and displays the total budget utilized by a department
async function viewBudget() {
  try {
    const departmentsSql = `SELECT id, name as department_name FROM departments;`;
    const [departments] = await db.promise().query(departmentsSql);

    const { departmentId } = await inquirer.prompt([
      {
        name: "departmentId",
        type: "list",
        message: "Select a department to view its total utilized budget:",
        choices: departments.map((d) => ({
          name: d.department_name,
          value: d.id,
        })),
      },
    ]);

    const sql = `SELECT e.id 'Employee ID', CONCAT(e.first_name, ' ', e.last_name) 'Employee', 
                            rol.title 'Title', dep.name 'Department', rol.salary 'Salary', 
                            CONCAT(m.first_name, ' ', m.last_name) manager
                     FROM employees e
                     LEFT JOIN employees m ON e.manager_id = m.id
                     JOIN roles rol ON e.role_id = rol.id
                     JOIN departments dep ON dep.id = rol.department_id
                     WHERE rol.department_id = ?
                     ORDER BY dep.name, e.first_name ASC;`;

    const [results] = await db.promise().query(sql, [departmentId]);

    const totalBudget = results.reduce((acc, employee) => {
      const salary = parseFloat(employee.Salary);
      if (!isNaN(salary)) {
        return acc + salary;
      } else {
        return acc;
      }
    }, 0);

    console.log(`Total Utilized Budget for the Department: $${totalBudget.toFixed(2)}`);

    if (!results.length) {
      console.log("No employees found for the selected department.");
      return;
    }

    console.table("\n", results);
  } catch (error) {
    console.error(
      "Failed to retrieve employees by department from the database.",
      error
    );
  }
}

// Exporting functions for external usage
module.exports = {
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
};
