const express = require('express');
const employeesRouter = express.Router();
const timesheetRouter = require('./timesheet');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Does this employee have the required fields?
function requiredEmployeedFields(employeeData) {
  return employeeData.name &&
  employeeData.position &&
  employeeData.wage;
}

// Does an employee with this ID exist in the DB?
employeesRouter.param('employeeId', (req, res, next, id) => {
  const employeeId = Number(id);
  db.get('SELECT * FROM Employee WHERE id = $id', { $id: employeeId }, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      req.employee = employee;
      req.employeeId = employeeId;
      next();
    } else {
      res.status(404).send();
    }
    });
  });

// Get all employees
employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE Employee.is_current_employee = 1',
    (error, employees) => {
      if (error) {
        next(error);
      } else {
        res.status(200).json({employees: employees});
      }
    });
});

// Get particular employee
employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({employee: req.employee});
});

// Add new employee (post)
employeesRouter.post('/', (req, res, next) => {
  const employeeData = req.body.employee;
  if (!requiredEmployeedFields(employeeData)) {
    return res.status(400).send();
      }

  db.run('INSERT INTO Employee (name, position, wage) VALUES ($name, $position, $wage)', {
    	$name: employeeData.name,
    	$position: employeeData.position,
    	$wage: employeeData.wage
    }, (error) => {
      if (error) {
      next(error);
      return; 
	} else {
    console.log(this.lastID);
		db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
			(error, employee) => {
        console.log('\n=============================================\n')


console.log(employee)
console.log('\n=============================================\n')
				res.status(201).json({employee: employee});
			});
		}
	});
});

// Update employee (put)
employeesRouter.put('/:employeeId', (req, res, next) => {
  const employeeData = req.body.employee;
  const employeeId = req.employeeId;
  if (!requiredEmployeedFields(employeeData)) {
    res.status(400).send();
    return;
  }

  db.run('UPDATE Employee SET name = $name, position = $position, wage = $wage', {
      $name: employeeData.name,
      $position: employeeData.position,
      $wage: employeeData.wage
  }, (error) => {
    if (error) {
    next(error) 
  } else {
    db.get('SELECT * FROM Employee WHERE id = $id', { $id: req.employee.id },
      (error, employee) => {
        res.status(200).json({employee: employee});
      });
    }
  });
});

// Delete employee
employeesRouter.delete('/:employeeId', (req, res, next) => {
  db.run('UPDATE Employee SET is_current_employee = 0 WHERE id IS $id', { $id: req.employee.id }, (error) => {
    if (error) {
      next(error);
    } else {
      db.get('SELECT * FROM Employee WHERE id = $id', { $id: req.employee.id },
        (error, employee) => {
          res.status(200).json({employee: employee});
      });
    }
  });
});

module.exports = employeesRouter;