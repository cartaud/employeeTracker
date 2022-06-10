//Questions: 70, 82, 128
const inquirer = require('inquirer'); //package that is used to prompt the user to answering questions 
const Query = require('./helpers/query');
const mysql = require('mysql2');
const cTable = require('console.table');


const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'rootroot',
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
        const departmentTable = new Query(`SELECT * FROM department`)
        departmentTable.getDepartment();
        timeout();
    }
    else if (data.action == 'view all roles') {
        const rolesTable = new Query(`SELECT roles.id, roles.title, roles.salary, department.name AS department FROM roles JOIN department ON department.id = roles.department_id;`)
        rolesTable.getRole();
        timeout();
    } 
    else if (data.action == 'view all employees') {
        const employeeTable = new Query(`SELECT employee.id, employee.first_name, employee.last_name, roles.title AS title, department.name AS department, roles.salary AS salary, manager.first_name AS manager_first, manager.last_name AS manager_last FROM employee JOIN roles ON employee.role_id = roles.id  JOIN department ON department.id = roles.department_id LEFT JOIN employee AS manager ON employee.manager_id = manager.id;`)
        employeeTable.getEmployee();
        timeout();
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
                choices: departmentList 
            },
        ])
        .then(addToDb);
    }

    else if (selection == 'employee') {
        const roleList = [];
        const managerList = ['None'];
        db.query(`SELECT title FROM roles`, function (err, results) {
            if (err) throw err
            results.forEach((role) => {
                roleList.push(role.title)
            })
        })
        db.query(`SELECT first_name, last_name FROM employee WHERE manager_id is null`, function (err, results) {
            if (err) throw err
            results.forEach((manager) => {
                managerList.push(manager.first_name + ' ' + manager.last_name)
            })
        })
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
            choices: roleList
        },
        {
            type: 'list',
            message: 'Who is the employee\'s manager?',
            name: 'employeeManager',
            choices: managerList
        }
    ])
    .then(addToDb);
    }
}

const addToDb = (data) => {
    const dbTable = Object.keys(data)[0]
    if (/department/.test(dbTable)) {
        const departmentEntry = new Query( `INSERT INTO department (name) VALUES ("${data.departmentName}");`)
        departmentEntry.addData(data.departmentName)
    }
    else if (/role/.test(dbTable)) {
        db.query(`SELECT id FROM department WHERE name = '${data.roleDepartment}'`, function(err, result) {
            if (err) throw err
            const roleEntry = new Query(`INSERT INTO roles (title, salary, department_id) VALUES ("${data.roleName}", ${data.roleSalary}, ${result[0].id});`)
            roleEntry.addData(data.roleName) 
        })
    }
    else if (/employee/.test(dbTable)) {
        let managerId 
        db.query(`SELECT id FROM roles WHERE title = '${data.employeeRole}'`, function(err, result) {
            if (err) throw err
            const roleId = result[0].id
            if (data.employeeManager == 'None') {
                managerId = null;
            }  
            else {
                const nameArr = data.employeeManager.split(" ")
                db.query(`SELECT id FROM employee WHERE first_name REGEXP '${nameArr[0]}' AND last_name REGEXP '${nameArr[1]}'`, function(err,result) {
                    if (err) throw err
                    managerId = result[0].id
                })
            }   
            const employeeEntry = new Query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${data.employeeFirst}", "${data.employeeLast}", ${roleId}, ${managerId});`)
            employeeEntry.addData(data.employeeFirst + ' ' + data.employeeLast)
            
        })
    }
    timeout();
}

const timeout = () => {
    setTimeout(function(){menu()}, 10);
}

menu()

/*toDO: 
when adding data, need to have corresponding id for users input (should be integer not string). Maybe need to REGEX to with input department and return id
add exit method on menu
Look at activity numbers 21 and 22 for DELETE method
*/