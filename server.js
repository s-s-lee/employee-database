// dependencies
const inquirer = require('inquirer');
const cTable = require('console.table');
const mysql = require('mysql2');

// connect to MySQL
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "rootroot",
    database: "employee_db"
});

connection.connect(err => {
    if (err) throw err;
    console.log('Successfully connected!')
    askUser();
});

// welcome ASCII art here?



// begin asking user Qs via inquirer module
askUser = () => {
    inquirer.prompt ([
        {
            type: 'list',
            name: 'choices',
            message: 'What would you like to do?',
            choices: ['View All Departments', 'View All Roles', 'View All Employees', 'View All Employees By Department', 'Add Department', 'Add Role', 'Add Employee', 'Remove Employee', 'Update Employee Role', 'Nothing']
        }
    ]).then(({option}) => {
        switch (option) {
            case 'View All Departments':
                viewAllDepts();
                break;
            case 'View All Roles':
                viewAllRoles();
                break;
            case 'View All Employees':
                viewAllEmployees();
                break;
            case 'View All Employees By Department':
                emplByDept();
                break;
            case 'Add Department':
                addDept();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Remove Employee':
                removeEmployee();
                break;
            case 'Update Employee Role':
                updateEmployeeRole();
                break;
            case 'Nothing':
                connection.end();
                break;
        };
    });
}

// view all depts
 viewAllDepts = () => {
    const data = `SELECT * FROM dept`;
    connection.promise().query(data, (err, rows) => {
        if (err) throw err;
        console.table(rows);
    })
    askUser();
};


// view all roles
viewAllRoles = () => {
    const data = `SELECT * FROM role`;
    connection.promise().query(data, (err, rows) => {
        if (err) throw err;
        console.table(rows);
    })
    askUser();
};

// view all employees
viewAllEmployees = () => {
    // const data = `SELECT * FROM employee`;
    const data = `SELECT employee.id, employee.first_name, employee.last_name, role.title, dept.name AS dept, role.salary, CONCAT(manager.first_name, '', manager.last_name) AS manager FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN dept ON dept.id = role.dept_id
    LEFT JOIN employee ON manager.id = employee.manager_id`

    connection.query(data, (err, rows) => {
        if (err) throw err;
        console.table(rows);
    })
    askUser();
};

// view all employees by dept
emplByDept = () => {
    console.log('Here are all the employees by department: ');
    const data = `SELECT dept.id, dept.name
    FROM employee 
    LEFT JOIN role ON employee.role_id = role.id 
    LEFT JOIN dept ON dept_id = role.dept.id`;
  
    connection.query(data, (err, res) => {
      if (err) throw err; 
      const selectedDept = res.map(data => ({ value: data.id, name: data.name }));
      console.table(res);
    askUser();
    });
}

// add dept
addDept = () => {
    inquirer.prompt([
        {
            name: 'addNewDept',
            message: 'What is the new department\'s name?',
        }
    ]).then((answer) => {
        const data = `INSERT INTO dept (name) VALUES (?)`;
        connection.query(data, answer.addNewDept, (err, result) => {
            if (err) throw err;
            console.log('Added new department!');
            viewAllDepts();
        })
    })
};

// add role
addRole = () => {
    inquirer.prompt([
        {
            name: 'role',
            message: 'What is this person\'s role?',
        },
        {
            name: 'salary',
            message: 'What is the salary for this role?',
        }
    ]).then((answer) => {
        const roleInfo = [answer.role, answer.salary];
        const roleInfoSql = `SELECT name, id FROM dept`;

        connection.promise().query(roleInfoSql, (err, data) => {
            if (err) throw err;
            const deptRole = data.map(({ name, id }) => ({ name: name, value: id }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'dept',
                    message: 'What department is this role within?',
                    choices: deptRole,
                }
            ]).then(deptOfRole => {
                const dept = deptOfRole.dept;
                roleInfo.push(dept);
                const data = `INSERT INTO role (title, salary, dept_id) VALUES (?, ?, ?)`;

                connection.query(data, roleInfo, (err, result) => {
                    if (err) throw err;
                    console.log(`Added ${answer.role} to the list of possible roles!`);

                    viewAllRoles();
                });
            });
        });
    });
};

// add employee
addEmployee = () => {
    inquirer.prompt([
        {
            name: 'firstName',
            message: 'What is the employee\'s first name?',
        },
        {
            name: 'lastName',
            message: 'What is the employee\'s last name?',
        },
    ]).then((answer) => {
        const emplName = [answer.firstName, answer.lastName];
        const roleInfo = 'SELECT role.id, role.title FROM role';
        connection.promise().query(roleInfo, (err, data) => {
            if (err) throw err;

            const roles = data.map(({ id, title }) => ({ name: title, value: id }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'role',
                    message: 'What is this employee\'s role?',
                    choices: roles,
                }
            ]).then(roleChoices => {
                const role = roleChoices.role;
                emplName.push(role);
                const mgrInfo = 'SELECT * FROM employee';
                connection.query(mgrInfo, (err, data) => {
                    if (err) throw err;
                    const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + '' + last_name, value:id }));
                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'manager',
                            message: 'Who is this employee\'s manager?',
                            choices: managers,
                        }
                    ]).then(selectedMgr => {
                        const manager = selectedMgr.manager;
                        emplName.push(manager);
                        const data = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                        VALUES (?, ?, ?, ?)`;
                        connection.query(data, emplName, (err, result) => {
                            if (err) throw err;
                            console.log('Employee has been successfully added!');
                            viewAllEmployees();
                        });
                    });
                });
            });
        });
    });
};

// remove employee
removeEmployee = () => {
    connection.query('SELECT * FROM employee', (err, data) => {
      if (err) throw err;
    
    const allEmployees = data.map(({ id, first_name, last_name }) => ({ name: first_name + '' + last_name, value: id }));
        inquirer.prompt([
            {
                type: 'list',
                name: 'name',
                message: 'Which employee would you like to delete?',
                choices: allEmployees,
            }
        ]).then(selectedEmpl => {
            const employee = selectedEmpl.name;
            const data = 'DELETE FROM employee WHERE id = ?';
            connection.query(data, employee, (err, result) => {
                if (err) throw err;
                console.log('Successfully removed employee!');

                viewAllEmployees();
            });
        });
    });
};


// update employee role
updateEmployeeRole = () => {
    const updateEmpl = 'SELECT * FROM employee';
    connection.promise().query(updateEmpl, (err, data) => {
        if (err) throw err;
    const updateEmplInfo = data.map(({ id, first_name, last_name }) => ({ name: first_name + '' + last_name, value: id }));
    // connection.query('SELECT * FROM role', (err, roles) => {
    //     if (err) throw err;
    //     roles = roles.map(({ id, title }) => ({ name: title, value: id }));
    // });
    inquirer.prompt([
        {
            type: 'list',
            name: 'name',
            message: 'Which employee needs updating?',
            choices: updateEmplInfo,
        },
        {
            type: 'list',
            name: 'role',
            message: 'What is their new role?',
            choices: roles,
        },
    ]).then((answers) => {
        connection.query('UPDATE employee SET ? WHERE ?',
        [{
            id: answers.name,
        },
        {
            role_id: answers.role,
        }], (err) => {
            if (err) throw err;
            console.log('Successfully updated employee!');

            viewAllEmployees();
        });
    });
  });
};

//         inquirer.prompt([
//             {
//                 type: 'list',
//                 name: 'name',
//                 message: 'Which employee needs updating?',
//                 choices: allEmployees
//             },
//             {
//                 type: 'list',
//                 name: 'newRole',
//                 message: 'What is their new role?',
//                 choices: roles
//             }
//         ]).then((answers) => {
//             connection.query('UPDATE employee SET ? WHERE ?',
//             [{
//                 id: answers.name,
//             },
//             {
//                 role_id: answers.newRole,
//             },
//         ], function (err) {
//             if (err) throw err;
//             console.log('Successfully updated employee!');
//             emplByDept();
//         });
//         })
//     })
// };

