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

class Query {
    constructor(query) {
        this.query = query
    }

    getDepartment() {
        const values = [];
        db.query(this.query, function (err, results) {
            if (err) throw err
            results.forEach((department) => {
                values.push([department.id, department.name])
            })
            console.table(['id', 'name'], values);
        })  
    }

    getRole() {
        const values = [];
        db.query(this.query, function (err, results) {
            if (err) throw err
            results.forEach((roles) => {
                values.push([roles.id, roles.title, roles.department, roles.salary])
            })
            console.table(['id', 'title', 'department', 'salary'], values);
        })  
    }

    getEmployee() {
        const values = [];
        db.query(this.query, function (err, results) {
            if (err) throw err
            results.forEach((employee) => {
                if (employee.manager_first == null) {
                    employee.manager_last = ''
                }
                values.push([employee.id, employee.first_name, employee.last_name, employee.title, employee.department, employee.salary, employee.manager_first + ' ' + employee.manager_last])
            })
            console.table(['id', 'first name', 'last name', 'title', 'department', 'salary', 'manager'], values);
        }) 
    }

    addData(name) {
        db.query(this.query, function (err, results) {
            if (err) throw err
            else console.log(`\nAdded ${name} to the database`)
        })
    }

    addRole(data) {
        db.query(`SELECT id FROM department WHERE name = '${data.roleDepartment}'`, function(err, result) {
            if (err) throw err
            const roleEntry = new Query(`INSERT INTO roles (title, salary, department_id) VALUES ("${data.roleName}", ${data.roleSalary}, ${result[0].id});`)
            roleEntry.addData(data.roleName) 
        })
    }

    addEmployee(data) {
        db.query(`SELECT id FROM roles WHERE title = '${data.employeeRole}'`, function(err, result) {
            if (err) throw err
            const roleId = result[0].id
            if (data.employeeManager == 'None') {
                const employeeEntry = new Query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${data.employeeFirst}", "${data.employeeLast}", ${roleId}, NULL);`)
                employeeEntry.addData(data.employeeFirst + ' ' + data.employeeLast)
            }  
            else {
                const nameArr = data.employeeManager.split(" ")
                db.query(`SELECT id FROM employee WHERE first_name REGEXP '${nameArr[0]}' AND last_name REGEXP '${nameArr[1]}'`, function(err,result) {
                    if (err) throw err
                    const employeeEntry = new Query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${data.employeeFirst}", "${data.employeeLast}", ${roleId}, ${result[0].id});`)
                    employeeEntry.addData(data.employeeFirst + ' ' + data.employeeLast)
                })
            }   
        })
    }

    listDepartment() {
        const departmentList = [];
        db.query(`SELECT name FROM department`, function (err, results) {
            if (err) throw err
            results.forEach((department) => {
                departmentList.push(department.name)
            })
        })
        return departmentList
    }

    listRoles() {
        const roleList = [];
        db.query(`SELECT title FROM roles`, function (err, results) {
            if (err) throw err
            results.forEach((role) => {
                roleList.push(role.title)
            })
        })
        return roleList
    }

    listManager() {
        const managerList = ['None'];
        db.query(`SELECT first_name, last_name FROM employee WHERE manager_id is null`, function (err, results) {
            if (err) throw err
            results.forEach((manager) => {
                managerList.push(manager.first_name + ' ' + manager.last_name)
            })
        })
        return managerList
    }
}

module.exports = Query