    const db = require("../config/connection");
    const inquirer = require("inquirer");

    async function viewAllDepartments(collectInput) {
    try {
        const data = await new Promise((resolve, reject) => {
        db.query(
            `SELECT dep.name 'Department', dep.id 'Associated ID' FROM departments dep;`,
            (err, res) => {
            if (err) reject(err);
            resolve(res);
            }
        );
        });

        console.table("\n", data);
    } catch (error) {
        console.error("Error viewing departments:", error);
    }
    }

    async function viewAllRoles(collectInput) {
    try {
        const data = await new Promise((resolve, reject) => {
        db.query(
            `SELECT rol.title 'Job title', rol.id 'Job ID', dep.name 'Departement', dep.id 'Department ID', rol.salary 'Salary' FROM roles rol LEFT JOIN departments dep ON rol.department_id = dep.id;`,
            (err, res) => {
            if (err) reject(err);
            resolve(res);
            }
        );
        });

        console.table("\n", data);
    } catch (error) {
        console.error("Error viewing roles:", error);
    }
    }

    async function viewAllEmployees(collectInput) {
    try {
        const data = await new Promise((resolve, reject) => {
        db.query(
            `SELECT e.id 'Employee ID', CONCAT(e.first_name, ' ', e.last_name) 'Employee', rol.title 'Title', dep.name 'Department', rol.salary 'Salary', CONCAT(m.first_name, ' ', m.last_name) manager FROM employees m RIGHT JOIN employees e ON e.manager_id = m.id JOIN roles rol ON e.role_id = rol.id JOIN departments dep ON dep.id = rol.department_id;`,
            (err, res) => {
            if (err) reject(err);
            resolve(res);
            }
        );
        });

        console.table("\n", data);
    } catch (error) {
        console.error("Error viewing roles:", error);
    }
    }

    async function addDepartment(collectInput) {
    try {
        const { newDepartment } = await inquirer.prompt([
        {
            name: "newDepartment",
            type: "input",
            message: "What is the department you want to add?",
        },
        ]);

        await new Promise((resolve, reject) => {
        db.query(
            `INSERT INTO departments SET ?`,
            { name: newDepartment },
            (err, res) => {
            if (err) reject(err);
            resolve(res);
            }
        );
        });

        console.log(`\n The new department has been saved.`);
    } catch (error) {
        console.error("Error adding department:", error);
    }
    }

    async function addRole(collectInput) {
    try {
        const { newRole } = await inquirer.prompt([
        {
            name: "newRole",
            type: "input",
            message: "What is the role you want to add?",
        },
        {
            name: "salary",
            type: "input",
            message: "What is the associated salary?",
        },
        {
            name: "departmentName",
            pageSize: 1000,
            type: "rawlist",
            message: "Which department should the role be associated with?",
            choices: departments,
        },
        ]);

        await new Promise((resolve, reject) => {
        db.query(`INSERT INTO roles SET ?`, { name: newRole }, (err, res) => {
            if (err) reject(err);
            resolve(res);
        });
        });
        console.log(`\n The new role has been saved.`);
    } catch (error) {
        console.error("Error adding role:", error);
    }
    }

    async function addEmployee(collectInput) {
    try {
        const { newEmployee } = await inquirer.prompt([
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
            pageSize: 1000,
            type: "rawlist",
            message: "What is the role of the new employee?",
            choices: roles,
        },
        {
            name: "manager",
            pageSize: 1000,
            type: "rawlist",
            message: "Who will manage the new employee?",
            choices: employees,
        },
        ]);

        await new Promise((resolve, reject) => {
        db.query(
            `INSERT INTO employees SET ?`,
            { name: newEmployee },
            (err, res) => {
            if (err) reject(err);
            resolve(res);
            }
        );
        });
        console.log(`\n The new employee has been saved.`);
    } catch (error) {
        console.error("Error adding employee:", error);
    }
    }

    async function updateEmployeeRole() {
        try {
            const rolesResponse = await db.query(`SELECT * FROM roles;`);
            const roles = rolesResponse.map(role => ({ name: role.title, id: role.id }));

            const employeesResponse = await db.query(`SELECT * FROM employees;`);
            const employees = employeesResponse.map(employee => ({
                name: `${employee.first_name} ${employee.last_name}`,
                id: employee.id
            }));

            const { employee, newRole } = await inquirer.prompt([
                {
                    name: "employee",
                    pageSize: 1000,
                    type: "rawlist",
                    message: "Which employee should be updated?",
                    choices: employees
                },
                {
                    name: "newRole",
                    pageSize: 1000,
                    type: "rawlist",
                    message: "What should be the new role of the employee?",
                    choices: roles
                }
            ]);

            await db.query(
                `UPDATE employees SET ? WHERE ?`,
                [
                    { role_id: newRole },
                    {
                        id: employees.find(e => e.name === employee).id
                    }
                ]
            );

            console.log("\nThe employee's new role has been saved.");
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
