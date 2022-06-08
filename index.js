const inquirer = require('inquirer') ; //package that is used to prompt the user to answering questions 
const mysql = require('mysql2');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'employee_db'
    },
    console.log('Connected to the employee_db database')
)

const menu = () => {
    inquirer
    .prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'action',
            choices: ['view all departments', 'view all roles', 'view all employees', 'add a department', 'add a role', 'add an employee', 'update an employee role']
        }
    ])
    .then(actionSelector)
}

const actionSelector = (data) => {
    if (data.action == 'view all departments') {
        view('department')
    }
    else if (data.action == 'view all roles') {
        view('roles')
    } 
    else if (data.action == 'view all employees') {
        view('employee')
    } 
    else if (data.action == 'add a department') {
        getDepartmentData()
    } 
    else if (data.action == 'add a role') {
        getRoleData()
    } 
    else if (data.action == 'add an employee') {
        getEmployeeData()
    } 
    else if (data.action == 'update an employee role') {
        console.log('update an employee role')
    } 
}


const view = (selection) => {
    let join
    if (selection == 'department') {
        join = ''
    }
    else if (selection == 'roles') {
        join = 'JOIN department ON roles.department_id = department.id'
    }
    else if (selection == 'employee') {
        join = 'JOIN roles ON employee.role_id = roles.id'
    }
    db.query(`SELECT * FROM ${selection} ${join}`, function (err, results) {
        if (err) throw err
        console.log(results)
        menu()
    })
}

const getDepartmentData = () => {
    inquirer
    .prompt([
        {
            type: 'input',
            message: 'What is the name of the department?',
            name: 'departmentName',
        }
    ])
    .then(createDepartment);
}

const createDepartment = (data) => {
    //read and write to department db
    console.log(`Added ${data.departmentName} to the database`)
    menu()
}

const getRoleData = () => {
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
            type: 'input',
            message: 'Which department does the role belong to?',
            name: 'roleDepartment',
        },
    ])
    .then(createRole);
}

const createRole = (data) => {
    //read and write to role db
    console.log(`Added ${data.roleName} to the database`)
    menu()
}

const getEmployeeData = () => {
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
            type: 'input',
            message: 'What is the employee\'s role?',
            name: 'employeeRole',
        },
        {
            type: 'input',
            message: 'Who is the employee\'s manager?',
            name: 'employeeManager',
        }
    ])
    .then(createEmployee);
}

const createEmployee = (data) => {
    //read and write to employee db
    console.log(`Added ${data.employeeFirst} ${data.employeeLast} to the database`)
    menu()
}

menu()