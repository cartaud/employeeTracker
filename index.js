//Questions: 70, 82, 128
const inquirer = require('inquirer'); //package that is used to prompt the user to answering questions 
const {readAndAppend} = require('./helpers/fsUtils');
const mysql = require('mysql2');
const cTable = require('console.table');

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
    .then(menuSelection)
}

const menuSelection = (data) => {
    if (data.action == 'view all departments') {
        viewTable('department')
    }
    else if (data.action == 'view all roles') {
        viewTable('roles')
    } 
    else if (data.action == 'view all employees') {
        viewTable('employee')
    } 
    else if (data.action == 'add a department') {
        collectData('department')
    } 
    else if (data.action == 'add a role') {
        collectData('roles')
    } 
    else if (data.action == 'add an employee') {
        collectData('employee')
    } 
    else if (data.action == 'update an employee role') {
        console.log('update an employee role')
    } 
}

const viewTable = (selection) => {
    const values = []
    if (selection == 'department') {
        db.query(`SELECT * FROM department`, function (err, results) {
            if (err) throw err
            results.forEach((department) => {
                values.push([department.id, department.name])
            })
            console.table(['id', 'name'], values);
            menu()
        })  
        
    }//
    else if (selection == 'roles') {
        db.query(`SELECT roles.id, roles.title, roles.salary, department.name AS department FROM roles JOIN department ON department.id = roles.department_id;`, function (err, results) {
            if (err) throw err
            results.forEach((roles) => {
                values.push([roles.id, roles.title, roles.department, roles.salary])
            })
            console.table(['id', 'title', 'department', 'salary'], values);
            menu()
        })  
    }
    else if (selection == 'employee') {
        db.query(`SELECT * FROM employee JOIN roles ON employee.role_id = roles.id`, function (err, results) {
            if (err) throw err
            results.forEach((employee) => {
                //do i need to query again to get the department and manager??
                values.push([employee.id, employee.first_name, employee.last_name, employee.title, employee.name, employee.salary, employee.id])
            })
            console.table(['id', 'first name', 'last name', 'title', 'department', 'salary', 'manager'], values);
            menu()
        }) 
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
        const departmentList = []
        db.query(`SELECT name FROM department`, function (err, results) {
            if (err) throw err
            results.forEach((department) => {
                departmentList.push(department.name)
            })
        })
        
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
                choices: departmentList //from the users selection here, do I query to get the id of the role?
            },
        ])
        .then(addToDb);
    }
    else if (selection == 'employee') {
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
    .then(addToDb);
    }
}

const addToDb = (data) => {
    const dbTable = Object.keys(data)[0]
    let dbInput
    if (/department/.test(dbTable)) {
        dbInput = 
        `INSERT INTO department (name) 
         VALUES ("${data.departmentName}");`
        console.log(`Added ${data.departmentName} to the database`)
    }
    else if (/role/.test(dbTable)) {
        dbInput = 
        `INSERT INTO roles (title, salary, department_id)
         VALUES ("${data.roleName}", ${data.roleSalary}, "${data.roleDepartment}");`
        console.log(`Added ${data.roleName} to the database`)
    }
    else if (/employee/.test(dbTable)) {
        dbInput =
        `INSERT INTO employee (first_name, last_name, role_id, manager_id)
         VALUES ("${data.employeeFirst}", "${data.employeeLast}", "${data.employeeRole}", "${data.employeeManager}");`
        console.log(`Added ${data.employeeFirst} ${data.employeeLast} to the database`)
    }
    readAndAppend(dbInput, './db/schema.sql')
    menu()
}

menu()

/*toDO: 
get correct ids to show on view roles (department id is showing instead) 
get managers name and department to show on view employees
when adding data, need to have corresponding id for users input (should be integer not string). Maybe need to REGEX to with input department and return id
add exit method on menu
*/