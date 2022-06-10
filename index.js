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
        const departmentTable = new Query(`SELECT * FROM department`)
        departmentTable.getDepartment();
        timeout();
    }
    else if (data.action == 'View All Roles') {
        const rolesTable = new Query(`SELECT roles.id, roles.title, roles.salary, department.name AS department FROM roles JOIN department ON department.id = roles.department_id;`)
        rolesTable.getRole();
        timeout();
    } 
    else if (data.action == 'View All Employees') {
        const employeeTable = new Query(`SELECT employee.id, employee.first_name, employee.last_name, roles.title AS title, department.name AS department, roles.salary AS salary, manager.first_name AS manager_first, manager.last_name AS manager_last FROM employee JOIN roles ON employee.role_id = roles.id  JOIN department ON department.id = roles.department_id LEFT JOIN employee AS manager ON employee.manager_id = manager.id;`)
        employeeTable.getEmployee();
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
        console.log('update an employee role')
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
        const queryDepartment = new Query() 
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
                choices: queryDepartment.listDepartment() 
            },
        ])
        .then(addToDb);
    }

    else if (selection == 'employee') {
        const queryRoles = new Query() 
        const queryManager = new Query() 
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
            choices: queryRoles.listRoles()
        },
        {
            type: 'list',
            message: 'Who is the employee\'s manager?',
            name: 'employeeManager',
            choices: queryManager.listManager()
        }
    ])
    .then(addToDb);
    }
}

const addToDb = (data) => {
    const dbTable = Object.keys(data)[0]
    if (/department/.test(dbTable)) {
        const departmentEntry = new Query( `INSERT INTO department (name) VALUES ("${data.departmentName}");`)
        departmentEntry.addData(data.departmentName) //adds specified data to db
    }
    else if (/role/.test(dbTable)) {
        const roleEntry = new Query() 
        roleEntry.addRole(data) //this query first gets the id of the role the user chose, then calls addData
    }
    else if (/employee/.test(dbTable)) {
        const employeeEntry = new Query() //this query first gets the id of role and manager then calls addData
        employeeEntry.addEmployee(data)
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