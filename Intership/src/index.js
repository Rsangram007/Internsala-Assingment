const express = require("express");
const mysql = require("mysql");
const app = express();
const port = 3000;

// Set up MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "test",
});
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database: ", err.message);
  } else {
    console.log("Connected to database");
  }
});
// Middleware for parsing JSON data
app.use(express.json());

// Route for creating a new employee with contact details
app.post("/employees", (req, res) => {
  const { name, email, phone, address, contactDetails } = req.body;

  connection.query(
    "INSERT INTO employess (name, email, phone, address) VALUES (?, ?, ?, ?)",
    [name, email, phone, address],
    (err, result) => {
      if (err) { 
        console.error(err.message);
        return res.status(500).json("Error creating employee",err.message);
      }

      const employeeId = result.insertId;

      const values = contactDetails.map((detail) => [
        employeeId,
        detail.type,
        detail.value,
      ]);

      connection.query(
        "INSERT INTO contact_details (employee_id, type, value) VALUES ?",
        [values],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error creating contact details");
          }

          return res.send("Employee created successfully", result);
        }
      );
    }
  );
});

// Route for listing employees with pagination
app.get("/employees", (req, res) => {
  const { limit, offset } = req.query;

  connection.query(
    "SELECT * FROM employees LIMIT ? OFFSET ?",
    [limit, offset],
    (err, employees) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error listing employees");
      }

      return res.send(employees);
    }
  );
});

// Route for updating an existing employee
app.put("/employees/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;

  connection.query(
    "UPDATE employees SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
    [name, email, phone, address, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error updating employee");
      }

      return res.send("Employee updated successfully");
    }
  );
});

// Route for deleting an existing employee
app.delete("/employees/:id", (req, res) => {
  const { id } = req.params;

  connection.query(
    "DELETE FROM employees WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error deleting employee");
      }

      return res.send("Employee deleted successfully");
    }
  );
});

// Route for getting a single employee by ID
app.get("/employees/:id", (req, res) => {
  const { id } = req.params;

  connection.query(
    "SELECT * FROM employees WHERE id = ?",
    [id],
    (err, employees) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error getting employee");
      }

      if (employees.length === 0) {
        return res.status(404).send("Employee not found");
      }

      connection.query(
        "SELECT * FROM contact_details WHERE employee_id = ?",
        [id],
        (err, contactDetails) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error getting contact details",err.message);
          }

          const employee = {
            ...employees[0],
            contactDetails,
          };

          return res.send(employee);
        }
      );
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
