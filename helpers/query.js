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

   
}

module.exports = Query