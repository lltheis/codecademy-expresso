const express = require('express');
const menuItemRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Does a menu item have all the required fields?
function requiredMenItemFields(menuItemData) {
  return menuItemData.name &&
  menuItemData.inventory &&
  menuItemData.price;
}


// Does a menu item with this ID exist in the DB?
menuItemRouter.param('menuItemId', (req, res, next, id) => {
  const menuItemId = Number(id);
  db.get('SELECT * FROM MenuItem WHERE id = $id', { $id: menuItemId }, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      res.status(404).send();
    }
  });
});

// Get all menu items
menuItemRouter.get('/', (req, res, next) => {
  const menu = req.menu;
  db.all('SELECT * FROM MenuItem WHERE menu_id = $menu_id', { $menu_id: menu.id },
    (error, menuItems) => {
      if (error) {
        next(error);
      } else {
        res.status(200).json({menuItems: menuItems});
      }
    });
});

// Get an individual menu item
menuItemRouter.get('/:menuItemId', (req, res, next) => {
  res.status(200).json({menuItems: mnuItems});
});

// Add a new menu item
menuItemRouter.post('/', (req, res, next) => {
  const menu = req.menu;
  const menuItemData = req.body.menuItem;

  if (!requiredMenItemFields(menuItemData)) {
    return res.status(400).send();
  }

  db.run('INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menu_id)', {
    $name: menuItemData.name,
    $description: menuItemData.description,
    $inventory: menuItemData.inventory,
    $price: menuItemData.price,
    $menu_id: menu.id,
  }, function(error) {
    if (error) {
      next(error);
      return;
    }
    db.get('SELECT * FROM MenuItem WHERE id = $id', { $id: this.lastID }, (error, menuItem) => {
      if (error) {
        next(error);
        return;
      }
      res.status(201).send({ menuItem });
    });
  });

});

// Update a new menu item
menuItemRouter.put('/:menuItemId', (req, res, next) => {
  const menuItemData = req.body.menuItem;
  const menuItemId = req.menuItem.id;
  const menu = req.menu;

  if (!requiredMenItemFields(menuItemData)) {
    res.status(400).send();
    return;
  }

  db.run('UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE menuItem.id = $id', {
    $name: menuItemData.name,
    $description: menuItemData.description,
    $inventory: menuItemData.inventory,
    $price: menuItemData.price,
    // $menu_id: menu.id,
    $id: menuItemId,
  }, function(error) {
    if (error) {
      next(error);
      return;
    }

    db.get('SELECT * FROM MenuItem WHERE id = $id', { $id: menuItemId }, (error, menuItem) => {
      if (error) {
      next(error);
      return;
      }

      res.status(200).send({ menuItem });
    });
  });
});

// Delete a new menu item
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