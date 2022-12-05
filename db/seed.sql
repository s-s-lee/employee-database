USE employee_db;

INSERT INTO dept (name) 
VALUES
('Engineering'),
('Finance'),
('Sales'),
('Legal');

INSERT INTO role (title, salary, dept_id) 
VALUES
('Lead Engineer', 150000, 1),
('Software Engineer', 120000, 1),
('Sales Lead', 100000, 3),
('Salesperson', 80000, 3),
('Legal Team Lead', 250000, 4),
('Lawyer', 190000, 4),
('Account Manager', 160000, 2),
('Accountant', 125000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES
('Susan', 'Lee', 1, null),
('Liam', 'Smith', 2, 1),
('Olivia', 'Johnson', 3, null),
('Noah', 'Williams', 4, 3),
('Ava', 'Brown', 5, null),
('Elijah', 'Jones', 6, 5),
('Mateo', 'Miller', 7, null),
('Amelia', 'Davis', 8, 7);