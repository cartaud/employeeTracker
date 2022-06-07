const inquirer = require('inquirer') ; //package that is used to prompt the user to answering questions 

const init = () => {
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
        console.log('view dep')
    }
    else if (data.action == 'view all roles') {
        console.log('view all roles')
    } 
    else if (data.action == 'view all employees') {
        console.log('view all employees')
    } 
    else if (data.action == 'add a department') {
        console.log('add a department')
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

init()