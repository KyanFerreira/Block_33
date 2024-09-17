const express = require("express");
const pg = require("pg");
const app = express();
const port = 3000;
const client = new pg.Client("postgres://localhost:5432/acme_hr_directory");
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World Lets Talk about Employees");
});

//GET All Employees
app.get("/api/employees", async (req, res) => {
  try {
    const response = await client.query("SELECT * FROM employees");
    console.log(response.rows);
    res.json(response.rows);
  } catch (err) {
    console.log("Could not get all due to this error " + err);
    res.send(err);
  }
});

//Get All Departments
app.get("/api/departments", async (req, res) => {
  try {
    const response = await client.query("SELECT * FROM departments");
    console.log(response.rows);
    res.json(response.rows);
  } catch (err) {
    console.log("Could not get departments because of " + err);
    res.send(err);
  }
});

//Add new Employee
app.post("/api/employees", async (req, res) => {
  try {
    const { name, department_id } = req.body;

    const response = await client.query(
      "INSERT INTO employees (name, department_id) VALUES ($1, $2) Returning *",
      [name, department_id]
    );
    res.json(response.rows);
  } catch (err) {
    console.log("Could not add new Employee because of " + err);
    res.send(err);
  }
});

//Delete Employee
app.delete("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await client.query("Delete from employees where id = $1", [
      id,
    ]);
    res.json(`Successfully Deleted Employee with ID of: ${id}`);
  } catch (err) {
    console.log("Could not delete employee because of " + err);
    res.send(err);
  }
});

//Update Employee
app.put("/api/employees/:id", async (req, res) => {
    try{
        const employeeId = parseInt(req.params.id);
        const { name, department_id } = req.body;
        console.log(employeeId);
        console.log(name);
        console.log(department_id);
      
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const date = today.getDate();
        readableDate = year + "-" + month + "-" + date;
        console.log(readableDate);
      
        const response = await client.query(`UPDATE employees set name = '${name}', 
              department_id = ${department_id}, updated_at = '${readableDate}'  WHERE id = ${employeeId} Returning *`);
        res.json(response.rows);
    }catch(err){
    console.log('Could not update Employee because of ' + err);
    res.send(err);
    }
});

const init = async () => {
  const SQL = `
DROP TABLE IF EXISTS employees ;
DROP TABLE IF EXISTS departments ;

CREATE TABLE departments(
id SERIAL PRIMARY KEY,
name VARCHAR(100)
);
CREATE TABLE employees(
id SERIAL PRIMARY KEY,
created_at TIMESTAMP DEFAULT now(),
updated_at TIMESTAMP DEFAULT now(),
name  VARCHAR(255) NOT NULL,
department_id  INTEGER REFERENCES departments(id) NOT NULL
);

INSERT INTO departments(name) VALUES('IT');
INSERT INTO departments(name) VALUES('Accounting');
INSERT INTO departments(name) VALUES('Marketing');
INSERT INTO employees(name, department_id) VALUES('Kyan Ferreira',  (SELECT id FROM departments WHERE name='IT'));
INSERT INTO employees(name, department_id) VALUES('Lorenzo Campbell', (SELECT id FROM departments WHERE name='Accounting'));
INSERT INTO employees(name, department_id) VALUES('Gerald Parson', (SELECT id FROM departments WHERE name='Marketing'));
INSERT INTO employees(name, department_id) VALUES('Jose Rijo', (SELECT id FROM departments WHERE name='Marketing'));
INSERT INTO employees(name, department_id) VALUES('David Lappert', (SELECT id FROM departments WHERE name='Marketing'));


`;

  await client.query(SQL);
};

app.listen(port, async () => {
  await client.connect();
  init();
  console.log(`Example app listening on port ${port} `);
});
