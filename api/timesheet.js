const express = require('express');
const timesheetRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const employeeRouter = require('./employee.js');

// Does this timesheet (put or post) have the required fields?
function requiredTimesheetFields(timesheetInfo) {
  return timesheetInfo.hours &&
  timesheetInfo.rate &&
  timesheetInfo.date;
};

// Does an timesheet with this ID exist in the DB?
timesheetRouter.param('timesheetId', (req, res, next, id) => {
  const timesheetId = Number(id);
  db.get('SELECT * FROM Timesheet WHERE id = $id', { $id: timesheetId }, 
    (error, timesheet) => {
    if (error) {
      next(error);
    } else if (timesheet) {
      req.timesheet = timesheet;
      next();
    } else {
      res.status(404).send();
    }
  });
});

// Get all timesheets
timesheetRouter.get('/', (req, res, next) => {
  const employeeId = req.employee;
  db.all('SELECT * FROM Timesheet WHERE employee_id = $employee_id', { $employee_id: employeeId }, 
    (error, timesheet) => {
    if (error) {
      next(error);
      return;
    }
    res.send({timesheet: timesheet});
  })
});

// Get particular timesheet
timesheetRouter.get('/:timesheetId', (req, res, next) => {
  res.status(200).json({timesheet: req.timesheet});
});

// Add new timesheet (post)
timesheetRouter.post('/', (req, res, next) => {
  const employee = req.employee;
  const newTimesheet = req.body.timesheet;

  if (!requiredTimesheetFields(newTimesheet)) {
    return res.status(400).send();
  }

  db.run('INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employee_id)', {
    $hours: newTimesheet.hours,
    $rate: newTimesheet.rate,
    $date: newTimesheet.date,
    $employee_id: newTimesheet.employeeId,
  }, function(error) {
    if (error) {
      next(error);
      return;
    }

  db.get('SELECT * FROM timesheet WHERE id = $id', { $id: this.lastID }, (error, timesheet) => {
      if (error) {
        next(error);
        return;
      }
      res.status(201).json({timesheet: timesheet });
    });
  });
});

// Update a timesheet (put)
timesheetRouter.put('/:timesheetId', (req, res, next) => {
  const updatedTimesheet = req.body.timesheet;
  const timesheetId = req.timesheet.id;
  const employee = req.employee;

  if (!requiredTimesheetFields(updatedTimesheet)) {
    res.status(400).send();
    return;
  }

  db.run('UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employee_id WHERE Timesheet.id = $id', {
      $hours: updatedTimesheet.hours,
      $rate: updatedTimesheet.rate,
      $date: updatedTimesheet.date,
      $employee_id: updatedTimesheet.employeeId,
      $id: updatedTimesheet.timesheetId,
  }, function(error) {
    if (error) {
      next(error);
      return;
    }

  db.get('SELECT * FROM Timesheet WHERE id = $id', { $id: req.timesheet.id }, (error, timesheet) => {
      res.status(200).json({timesheet: timesheet});
    });
  });
});

// Delete a timesheet 
timesheetRouter.delete('/:timesheetId', (req, res, next) => {
  const timesheet = req.timesheet;

  db.run('DELETE FROM Timesheet WHERE id = $id', { $id: timesheet.id }, 
    (error, timesheet) => {
    if (error) {
      next(error);
      return;
    }
    res.status(204).send();
  });
});

module.exports = timesheetRouter;