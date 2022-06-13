const inquirer = require('inquirer'); //package that is used to prompt the user to answering questions 
const Query = require('./helpers/query'); //helper function that includes all of the database methods 

const menu = () => { //list all of the different actions the user can take to view or modify the db 
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

const menuSelection = (data) => { //data.action is the value of the users choice from the menu()
    if (data.action == 'View All Departments') { 
        const queryDepartment = new Query(`SELECT * FROM department`) //selects all fields from the department table in db 
        queryDepartment.getDepartmentTable(); //displays content in neatly in a table in the console
        timeout(); //the timeout function calls the menu() after a very short delay. This ensures the menu() function gets called to the stack after our data gets returned from db
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
        collectData('department') //for all of the methods for modifying the db, inquirer is used again to collect info from user
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
    if (selection == 'department') { //adding a department 
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
    else if (selection == 'roles') { //adding a role
        const queryDepartmentName = new Query(`SELECT name FROM department`) //selects all department names
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
                choices: queryDepartmentName.listDepartments() //returns an array of all department names
            },
        ])
        .then(addToDb);
    }

    else if (selection == 'employee') { //adding an employee
        const queryRolesTitle = new Query(`SELECT title FROM roles`) //selects all role titles 
        const queryManagerName = new Query(`SELECT first_name, last_name FROM employee WHERE manager_id is null`) //selects the first and last names of all employees who's managers field is NULL (hence all the managers)
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
                choices: queryRolesTitle.listRoles() //returns an array of a roles
            },
            {
                type: 'list',
                message: 'Who is the employee\'s manager?',
                name: 'employeeManager',
                choices: queryManagerName.listManagers() //returns an array of the full name of all managers
            }
        ])
        .then(addToDb);
    }
    else if (selection == 'updateRole') { //updating a role
        const queryEmployeeName = new Query(`SELECT first_name, last_name FROM employee`) //selects first and last name of all employees
        const queryRolesTitle = new Query(`SELECT title FROM roles`) //selects all role titles
        inquirer
        .prompt([
            {
                type: 'password', //in order to have the following query methods arrays return with values, I needed to add an inquirer prompt before 
                message: 'Admin Password:', //this value entered here can by anything as it is never checked 
                name: 'updatePassword',
                mask: true
            },
            {
                type: 'list',
                message: 'Which employee\'s role do you want to update?',
                name: 'updateEmployee',
                choices: queryEmployeeName.listEmployees() //returns an array of all employees
            },
            {
                type: 'list',
                message: 'Which role do you want to assign to the selected employee?',
                name: 'updateEmployeeRole',
                choices: queryRolesTitle.listRoles() //returns an array of all roles
            }
        ])
        .then(addToDb);
    }
}

const addToDb = (data) => {
    const key = Object.keys(data)[0] //uses REGEX to determine what to modify in db
    if (/department/.test(key)) {
        const departmentEntry = new Query(`INSERT INTO department (name) VALUES ("${data.departmentName}");`) //inserts the name of the department the user created into db
        departmentEntry.addData(data.departmentName) //adds specified data to db
    }
    else if (/role/.test(key)) {
        const roleEntry = new Query(`SELECT id FROM department WHERE name = '${data.roleDepartment}'`)  
        roleEntry.addRole(data) //this query first gets the id of the role the user chose, then calls addData in helper module 
    }
    else if (/employee/.test(key)) {
        const employeeEntry = new Query(`SELECT id FROM roles WHERE title = '${data.employeeRole}'`) //this query first gets the id of role and manager then calls addData
        employeeEntry.addEmployee(data)
    }
    else if (/update/.test(key)) {
        const employeeUpdate = new Query(`SELECT id FROM roles WHERE title = '${data.updateEmployeeRole}'`)
        employeeUpdate.updateRole(data)  //this query first gets the id of role we want to update then calls addData
    }
    timeout();
}

const timeout = () => {
    setTimeout(function(){menu()}, 10);
}

menu() //calls menu on start 