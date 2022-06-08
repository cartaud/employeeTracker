DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE roles (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id)
    REFERENCES department(id)
    ON DELETE SET NULL
);

CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT NOT NULL,
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
);

INSERT INTO department (name)
VALUES ("department one"),
       ("department two"),
       ("department three"),
       ("department four");

INSERT INTO roles (title, salary, department_id)
VALUES ("MANAGER", 100000.00, 1),
       ("ENGINEER", 90000.00, 1),
       ("SALES", 80000.00, 1),
       ("SECURITY", 70000.00, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("BOB", "BUILDER", 1, 2),
       ("JACK", "INDABOX", 1, 2),
       ("ELON", "MUSK", 1, 2),
       ("JEFF", "BEZOS", 1, 2);