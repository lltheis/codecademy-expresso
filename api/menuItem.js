const express = require('express');
const menuItemRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sqlQuery = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
  const menuItemValues = {$menuItemId: menuItemId};
  db.get(sqlQuery, menuItemValues, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuItemRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM MenuItem',
    (err, menuItem) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({menuItem: menuItem});
      }
    });
});

menuItemRouter.get('/:menuItemId', (req, res, next) => {
  res.status(200).json({menuItem: req.menuItem});
});

menuItemRouter.post('/', (req, res, next) => {
	const name = req.body.menuItem.name,
        description = req.body.menuItem.description;
  if (!name || !description) {
    return res.sendStatus(400);
  }

const insertMenuItem = 'INSERT INTO MenuItem (name, description) VALUES ($name, $description)';
const insertMenuItemValues = {
	$name: name,
	$description: description
};

db.run(insertMenuItem, insertMenuItemValues, function(error) {
	if (error) {
		next(error) 
	} else {
		db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
			(error, menuItem) => {
				res.status(201).json({menuItem: menuItem});
			});
		}
	});
});

menuItemRouter.put('/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description;
  if (!name || !description) {
    return res.sendStatus(400);
  }

  const sqlQuery = 'UPDATE MenuItem SET name = $name, description = $description ' +
      'WHERE MenuItem.id = $menuItemId';
  const menuItemValues = {
    $name: name,
    $description: description,
    $menuItemId: req.params.menuItemId
  };

  db.run(sqlQuery, menuItemValues, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
        (error, menuItem) => {
          res.status(200).json({menuItem: menuItem});
        });
    }
  });
});

menuItemRouter.delete('/:menuItemId', (req, res, next) => {
  const issueSql = 'SELECT * FROM Issue WHERE Issue.menuItem_id = $menuItemId';
  const issueValues = {$menuItemId: req.params.menuItemId};
  db.get(issueSql, issueValues, (error, issue) => {
    if (error) {
      next(error);
    } else if (issue) {
      res.sendStatus(400);
    } else {
      const deleteSql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';
      const deleteValues = {$menuItemId: req.params.menuItemId};

      db.run(deleteSql, deleteValues, (error) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});

module.exports = menuItemRouter;