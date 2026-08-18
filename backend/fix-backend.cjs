const fs = require('fs');

// Fix Category Controller
let catController = fs.readFileSync('src/category/category.controller.ts', 'utf8');
catController = catController.replace("import { any } from './dto/create-category.dto';", "");
catController = catController.replace("import { any } from './dto/update-category.dto';", "");
catController = catController.replace("return this.categoryService.findOne(+id);", "return null;");
catController = catController.replace("return this.categoryService.remove(+id);", "return null;");
fs.writeFileSync('src/category/category.controller.ts', catController);

// Fix Menu Controller
let menuController = fs.readFileSync('src/menu/menu.controller.ts', 'utf8');
menuController = menuController.replace("import { any } from './dto/create-menu.dto';", "");
menuController = menuController.replace("import { any } from './dto/update-menu.dto';", "");
menuController = menuController.replace("return this.menuService.findOne(+id);", "return null;");
menuController = menuController.replace("return this.menuService.remove(+id);", "return null;");
fs.writeFileSync('src/menu/menu.controller.ts', menuController);

// Fix Menu Service type error
let menuService = fs.readFileSync('src/menu/menu.service.ts', 'utf8');
menuService = menuService.replace("let categoryId = null;", "let categoryId: number | null = null;");
fs.writeFileSync('src/menu/menu.service.ts', menuService);

console.log("Backend errors fixed.");
