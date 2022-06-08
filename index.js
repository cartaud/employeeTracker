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
        add('department')
    } 
    else if (data.action == 'add a role') {
        console.log('add a role')
    } 
    else if (data.action == 'add an employee') {
        console.log('add an employee')
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
    else if (selection == 'employees') {
        join = 'JOIN roles ON employee.role_id = roles.id'
    }
    db.query(`SELECT * FROM ${selection} ${join}`, function (err, results) {
        if (err) throw err
        console.log(results)
        menu()
    })
}

const add = (selection) => {

}

menu()