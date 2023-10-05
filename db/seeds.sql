-- Insert data into departments
INSERT INTO departments (name)
VALUES
      ('Legal'),
      ('Engineering'),
      ('Customer Service'),
      ('Sales and Marketing'),
      ('Finance'),
      ('Research and Development'),
      ('Quality Management'),
      ('Human Resources'),
      ('IT'),
      ('Accounting');

-- Insert data into roles
INSERT INTO roles (title, salary, department_id)
VALUES
      ('Sales Manager', 90000, 4),
      ('Quality Control Manager', 85000, 7),
      ('Engineering Manager', 95000, 2),
      ('Development Manager', 87000, 6),
      ('Human Resources Manager', 82000, 8),
      ('Accounting Manager', 89000, 10),
      ('Lawyer', 110000, 1),
      ('IT Manager', 88000, 9),
      ('Customer Service Manager', 83000, 3),
      ('Finance Manager', 91000, 5),
      ('Marketing Specialist', 78000, 4),
      ('Quality Assurance Engineer', 82000, 7),
      ('Software Engineer', 99000, 2),
      ('R&D Scientist', 93000, 6),
      ('HR Coordinator', 72000, 8),
      ('Accountant', 86000, 10),
      ('Paralegal', 76000, 1),
      ('IT Support Specialist', 74000, 9),
      ('Customer Service Representative', 68000, 3),
      ('Financial Analyst', 94000, 5);

-- Insert data into employees
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
      ('Walter', 'White', 1, NULL),
      ('Jesse', 'Pinkman', 2, 1),
      ('Jimmy', 'McGill', 3, NULL),
      ('Mike', 'Ehrmantraut', 4, NULL),
      ('Gustavo', 'Fring', 5, NULL),
      ('Hank', 'Schrader', 6, NULL),
      ('Kim', 'Wexler', 7, 3),
      ('Saul', 'Goodman', 8, NULL),
      ('Howard', 'Hamlin', 9, NULL),
      ('Charles', 'McGill', 10, 3),
      ('Tuco', 'Salamanca', 11, NULL),
      ('Hector', 'Salamanca', 12, 11),
      ('Skyler', 'White', 13, 1),
      ('Marie', 'Schrader', 14, 6),
      ('Leonel', 'Salamanca', 15, 11),
      ('Marco', 'Salamanca', 16, 11),
      ('Steven', 'Gomez', 17, 6),
      ('Brandon', 'Mayhew', 18, 2),
      ('Lydia', 'Quayle', 19, 5),
      ('Todd', 'Alquist', 20, NULL);
