//Questions: 70, 82, 128
const inquirer = require('inquirer'); //package that is used to prompt the user to answering questions 
const Query = require('./helpers/query');

const menu = () => {
    inquirer
    .prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'action',
            choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add Department', 'Add Role', 'Add Employee', 'Update Employee Role', 'Quit']
        }
    ])
    .then(menuSelection)
}

const menuSelection = (data) => {
    if (data.action == 'View All Departments') {
        const queryDepartment = new Query(`SELECT * FROM department`)
        queryDepartment.getDepartmentTable();
        timeout();
    }
    else if (data.action == 'View All Roles') {
        const queryRoles = new Query(`SELECT roles.id, roles.title, roles.salary, department.name AS department FROM roles JOIN department ON department.id = roles.department_id;`)
        queryRoles.getRolesTable();
        timeout();
    } 
    else if (data.action == 'View All Employees') {
        const queryEmployee = new Query(`SELECT employee.id, employee.first_name, employee.last_name, roles.title AS title, department.name AS department, roles.salary AS salary, manager.first_name AS manager_first, manager.last_name AS manager_last FROM employee JOIN roles ON employee.role_id = roles.id  JOIN department ON department.id = roles.department_id LEFT JOIN employee AS manager ON employee.manager_id = manager.id;`)
        queryEmployee.getEmployeeTable();
        timeout();
    } 
    else if (data.action == 'Add Department') {
        collectData('department')
    } 
    else if (data.action == 'Add Role') {
        collectData('roles')
    } 
    else if (data.action == 'Add Employee') {
        collectData('employee')
    } 
    else if (data.action == 'Update Employee Role') {
        collectData('updateRole')
    } 
    else if (data.action == 'Quit') {
        process.exit(1)
    }
}

const collectData = (selection) => {
    if (selection == 'department') {
        inquirer
        .prompt([
            {
                type: 'input',
                message: 'What is the name of the department?',
                name: 'departmentName',
            }
        ])
    .then(addToDb);
    }
    else if (selection == 'roles') {
        const queryDepartmentName = new Query(`SELECT name FROM department`) 
        inquirer
        .prompt([
            {
                type: 'input',
                message: 'What is the name of the role?',
                name: 'roleName',
            },
            {
                type: 'input',
                message: 'What is the salary of the role?',
                name: 'roleSalary',
            },
            {
                type: 'list',
                message: 'Which department does the role belong to?',
                name: 'roleDepartment',
                choices: queryDepartmentName.listDepartments() 
            },
        ])
        .then(addToDb);
    }

    else if (selection == 'employee') {
        const queryRolesTitle = new Query(`SELECT title FROM roles`) 
        const queryManagerName = new Query(`SELECT first_name, last_name FROM employee WHERE manager_id is null`) 
        inquirer
        .prompt([
            {
                type: 'input',
                message: 'What is the employee\'s first name?',
                name: 'employeeFirst',
            },
            {
                type: 'input',
                message: 'What is the employee\'s last name?',
                name: 'employeeLast',
            },
            {
                type: 'list',
                message: 'What is the employee\'s role?',
                name: 'employeeRole',
                choices: queryRolesTitle.listRoles()
            },
            {
                type: 'list',
                message: 'Who is the employee\'s manager?',
                name: 'employeeManager',
                choices: queryManagerName.listManagers()
            }
        ])
        .then(addToDb);
    }
    else if (selection == 'updateRole') {
        const queryEmployeeName = new Query(`SELECT first_name, last_name FROM employee`)
        const queryRolesTitle = new Query(`SELECT title FROM roles`) 
        inquirer
        .prompt([
            {
                type: 'password',
                message: 'Please enter the admin password to continue:',
                name: 'updatePassword',
                mask: true
            },
            {
                type: 'list',
                message: 'Which employee\'s role do you want to update?',
                name: 'updateEmployee',
                choices: queryEmployeeName.listEmployees()
            },
            {
                type: 'list',
                message: 'Which role do you want to assign to the selected employee?',
                name: 'updateEmployeeRole',
                choices: queryRolesTitle.listRoles()
            }
        ])
        .then(addToDb);
    }
}

const addToDb = (data) => {
    const key = Object.keys(data)[0]
    if (/department/.test(key)) {
        const departmentEntry = new Query(`INSERT INTO department (name) VALUES ("${data.departmentName}");`)
        departmentEntry.addData(data.departmentName) //adds specified data to db
    }
    else if (/role/.test(key)) {
        const roleEntry = new Query(`SELECT id FROM department WHERE name = '${data.roleDepartment}'`) 
        roleEntry.addRole(data) //this query first gets the id of the role the user chose, then calls addData
    }
    else if (/employee/.test(key)) {
        const employeeEntry = new Query(`SELECT id FROM roles WHERE title = '${data.employeeRole}'`) //this query first gets the id of role and manager then calls addData
        employeeEntry.addEmployee(data)
    }
    else if (/update/.test(key)) {
        const employeeUpdate = new Query(`SELECT id FROM roles WHERE title = '${data.updateEmployeeRole}'`)
        employeeUpdate.updateRole(data)
    }
    timeout();
}

const timeout = () => {
    setTimeout(function(){menu()}, 10);
}

menu()

/*toDO: 
Look at activity numbers 21 and 22 for DELETE method
*/