const inquirer = require('inquirer');
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect();

const handleUserChoice = (choice) => {
  switch (choice) {
    case 'View All Departments':
      viewAllDepartments();
      break;
    case 'View All Roles':
      viewAllRoles();
      break;
    case 'View All Employees':
      viewAllEmployees();
      break;
    case 'Add a Department':
      addDepartment();
      break;
    case 'Add a Role':
      addRole();
      break;
    case 'Add an Employee':
      addEmployee();
      break;
    case 'Update an Employee Role':
      updateEmployeeRole();
      break;
    default:
      console.log('Invalid choice. Please try again.');
      break;
  }
};

const viewAllDepartments = () => {
  client.query('SELECT * FROM department', (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    console.table(res.rows);
  });
};

const viewAllRoles = () => {
  client.query('SELECT * FROM role', (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    console.table(res.rows);
  });
};

const viewAllEmployees = () => {
  client.query('SELECT * FROM employee', (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    console.table(res.rows);
  });
};

const addDepartment = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'departmentName',
      message: 'Enter the name of the new department:',
    }
  ]).then(({ departmentName }) => {
    const query = 'INSERT INTO department (name) VALUES ($1)';
    client.query(query, [departmentName], (err, res) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Department added successfully');
    });
  });
};

const addRole = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'roleName',
      message: 'Enter the name of the new role:',
    },
    {
      type: 'input',
      name: 'salary',
      message: 'Enter the salary for the new role:',
    },
    {
      type: 'input',
      name: 'departmentId',
      message: 'Enter the department ID for the new role:',
    }
  ]).then(({ roleName, salary, departmentId }) => {
    const query = 'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)';
    client.query(query, [roleName, salary, departmentId], (err, res) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Role added successfully');
    });
  });
};

const addEmployee = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: 'Enter the first name of the new employee:',
    },
    {
      type: 'input',
      name: 'lastName',
      message: 'Enter the last name of the new employee:',
    },
    {
      type: 'input',
      name: 'roleId',
      message: 'Enter the role ID for the new employee:',
    },
    {
      type: 'input',
      name: 'managerId',
      message: 'Enter the manager ID for the new employee (leave blank if none):',
      default: null
    }
  ]).then(({ firstName, lastName, roleId, managerId }) => {
    const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)';
    client.query(query, [firstName, lastName, roleId, managerId], (err, res) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Employee added successfully');
    });
  });
};

const updateEmployeeRole = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'employeeId',
      message: 'Enter the ID of the employee to update:',
    },
    {
      type: 'input',
      name: 'newRoleId',
      message: 'Enter the new role ID for the employee:',
    }
  ]).then(({ employeeId, newRoleId }) => {
    const query = 'UPDATE employee SET role_id = $1 WHERE id = $2';
    client.query(query, [newRoleId, employeeId], (err, res) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Employee role updated successfully');
    });
  });
};

// Function to set up the database
const setupDatabase = () => {
  const schema = fs.readFileSync('db/schema.sql').toString();
  const seeds = fs.readFileSync('db/seeds.sql').toString();

  client.query(schema, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Database schema created successfully');

    client.query(seeds, (err, res) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Database seeded successfully');
      client.end();
    });
  });
};

// Uncomment the following line to set up the database
setupDatabase();

inquirer
  .prompt([
    {
      type: 'list',
      name: 'menu',
      message: 'What would you like to do?',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add a Department',
        'Add a Role',
        'Add an Employee',
        'Update an Employee Role'
      ]
    }
  ])
  .then((response) => {
    handleUserChoice(response.menu);
  });
