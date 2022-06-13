const mysql = require('mysql2');
const cTable = require('console.table'); //allows us to have neat looking tables in console

const db = mysql.createConnection( //creates connection to db
    {
        host: 'localhost',
        user: 'root',
        password: 'rootroot',
        database: 'employee_db'
    },
    console.log('Connected to the employee_db database')
)

class Query { //class that contains all methods for viewing and modifying db
    constructor(query) {
        this.query = query
    }

    getDepartmentTable() { //shows department table in console
        const values = [];
        db.query(this.query, function (err, results) {
            if (err) throw err
            results.forEach((department) => {
                values.push([department.id, department.name]) //pushes the id and name of each department into arr
            })
            console.table(['id', 'name'], values); //(Table Headers, Table Values)
        })  
    }

    getRolesTable() {
        const values = [];
        db.query(this.query, function (err, results) {
            if (err) throw err
            results.forEach((roles) => {
                values.push([roles.id, roles.title, roles.department, roles.salary]) //pushes the id, title, department, and salary of each role into arr
            })
            console.table(['id', 'title', 'department', 'salary'], values);
        })  
    }

    getEmployeeTable() {
        const values = [];
        db.query(this.query, function (err, results) {
            if (err) throw err
            results.forEach((employee) => {
                if (employee.manager_first == null) { //if the employee does not have a manager, they must be a manager
                    employee.manager_last = '' //ensures 'null null' is not inserted for first and last name of manager section 
                }  //pushes each employee id, first name, last name, role title, department name, salary, and manager name into arr
                values.push([employee.id, employee.first_name, employee.last_name, employee.title, employee.department, employee.salary, employee.manager_first + ' ' + employee.manager_last])
            })
            console.table(['id', 'first name', 'last name', 'title', 'department', 'salary', 'manager'], values);
        }) 
    }

    addData(name) {
        db.query(this.query, function (err, results) { //adds given data, using the query written as a constructor to db
            if (err) throw err
            else console.log(`\nAdded ${name} to the database`)
        })
    }

    addRole(data) {
        db.query(this.query, function(err, result) {
            if (err) throw err //first gets the if of the role then inserts all required fields into roles table
            const roleEntry = new Query(`INSERT INTO roles (title, salary, department_id) VALUES ("${data.roleName}", ${data.roleSalary}, ${result[0].id});`)
            roleEntry.addData(data.roleName) 
        })
    }

    addEmployee(data) {
        db.query(this.query, function(err, result) {
            if (err) throw err
            const roleId = result[0].id //first gets the role id for the employee
            if (data.employeeManager == 'None') { //if the employee is a manager we can input null into that field  
                const employeeEntry = new Query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${data.employeeFirst}", "${data.employeeLast}", ${roleId}, NULL);`)
                employeeEntry.addData(data.employeeFirst + ' ' + data.employeeLast)
            }  
            else { //if the employee is not a manager, we first need to get the full name of their manager
                const nameArr = data.employeeManager.split(" ")
                db.query(`SELECT id FROM employee WHERE first_name REGEXP '${nameArr[0]}' AND last_name REGEXP '${nameArr[1]}'`, function(err,result) {
                    if (err) throw err
                    const employeeEntry = new Query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${data.employeeFirst}", "${data.employeeLast}", ${roleId}, ${result[0].id});`)
                    employeeEntry.addData(data.employeeFirst + ' ' + data.employeeLast)
                })
            }   
        })
    }

    listDepartments() { //returns an array of the name of all departments 
        const departmentList = [];
        db.query(this.query, function (err, results) {
            if (err) throw err
            results.forEach((department) => { 
                departmentList.push(department.name)
            })
        })
        return departmentList
    }

    listRoles() { //returns an array of the title of each role
        const roleList = [];
        db.query(this.query, function (err, results) {
            if (err) throw err
            results.forEach((role) => {
                roleList.push(role.title)
            })
        })
        return roleList
    }

    listManagers() { //returns an array of the full name of each manager 
        const managerList = ['None'];
        db.query(this.query, function (err, results) { 
            if (err) throw err
            results.forEach((manager) => {
                managerList.push(manager.first_name + ' ' + manager.last_name)
            })
        })
        return managerList
    }

    listEmployees() { //returns an array of all employees 
        const employeeList = [];
        db.query(this.query, function (err, results) {
            if (err) throw err
            results.forEach((employee) => {
                employeeList.push(employee.first_name + ' ' + employee.last_name)
            })
        })
        return employeeList
    }

    updateRole(data) { //updates an employees role
        db.query(this.query, function(err, result) { //gets the id of chosen role
            if (err) throw err
            const nameArr = data.updateEmployee.split(" ")
            db.query(`UPDATE employee SET role_id = ${result[0].id} WHERE first_name REGEXP '${nameArr[0]}' AND last_name REGEXP '${nameArr[1]}';`, function(err, result) {
                if (err) throw err
                console.log(`\nUpdated ${data.updateEmployee}'s role`)
            })
        
        })
    }
}

module.exports = Query