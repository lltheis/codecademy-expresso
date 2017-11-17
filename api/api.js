const express = require('express');
const apiRouter = express.Router();

// import employees router and mount it at /employees
const employeesRouter = require('./employee.js');
apiRouter.use('/employees', employeesRouter);

// import timesheet router and mount it at /timesheet
const timesheetRouter = require('./timesheet.js');
apiRouter.use('/timesheet', timesheetRouter);

// import menu router and mount it at /menu
const menuRouter = require('./menu.js');
apiRouter.use('/menu', menuRouter);

// import menuItem router and mount it at /menuItem
const menuItemRouter = require('./menuItem.js');
apiRouter.use('/menuItem', menuItemRouter);

module.exports = apiRouter;