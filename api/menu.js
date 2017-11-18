const express = require('express');
const menuRouter = express.Router();
const menuItemRouter = require('./menuItem');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Does this menu (put or post) have the required fields?
function hasRequiredMenuFields(menuData) {
  return !!menuData.title;
}

// Does an menu with this ID exist in the DB?
menuRouter.param('menuId', (req, res, next, id) => {
  const menuId = Number(id);
  db.get('SELECT * FROM Menu WHERE id = $id', { $id: menuId }, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.status(404).send();
    }
  });
});

// Get all menus
menuRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (error, menus) => {
    if (error) {
      next(error);
      return;
    }
    res.status(201).json({menus: menus});
  })
});

// Add new menu (post)
menuRouter.post('/', (req, res, next) => {
  const menuData = req.body.menu;

  if (!hasRequiredMenuFields(menuData)) {
    return res.status(400).send();
  }

  db.run('INSERT INTO Menu (title) VALUES ($title)', {
    $title: menuData.title,
  }, function(error) {
    if (error) {
      next(error);
      return;
    }

    db.get('SELECT * FROM Menu WHERE id = $id', { $id: this.lastID }, (error, menu) => {
      if (error) {
        next(error);
        return;
      }
      res.status(201).json({menu: menu});
    });
  });

});


// Update a menu (put)
menuRouter.put('/:menuId', (req, res, next) => {
  const menuData = req.body.menu;
  const menuId = req.menu.id;
  if (!hasRequiredMenuFields(menuData)) {
    res.status(400).send();
    return;
  }

  db.run('UPDATE Menu SET title = $title WHERE $id = $id', {
    $title: menuData.title,
    $id: menuId,
  }, function(error) {
    if (error) {
      next(error);
      return;
    }

  db.get('SELECT * FROM Menu WHERE id = $id', { $id: menuId }, 
    (error, menu) => {
      if (error) {
      next(error);
      return;
      }
      res.status(201).json({menu: menu});
    });
  });
});

// Delete a menu
menuRouter.delete('/:menuId', (req, res, next) => {
  const menu = req.menu;

  db.get('SELECT * FROM MenuItem WHERE menu_id = $menu_id', { $menu_id: menu.id }, (error, menuItem) => {
    if (error) {
      next(error);
      return;
    }

    if (menuItem) {
      res.status(400).send();
      return;
    }

    db.run('DELETE FROM Menu WHERE id = $id', { $id: menu.id }, 
      (error, menu) => {
      if (error) {
      next(error);
      return;
      }
      res.status(204).send();
    });
  });
});

module.exports = menuRouter;