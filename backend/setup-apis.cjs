const fs = require('fs');

// 1. Prisma Service
const prismaServiceCode = `import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
`;
fs.writeFileSync('src/prisma/prisma.service.ts', prismaServiceCode);

// 2. Category Service & Controller
const categoryServiceCode = `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.category.create({ data });
  }

  findAll() {
    return this.prisma.category.findMany({ orderBy: { displayOrder: 'asc' } });
  }

  update(id: number, data: any) {
    return this.prisma.category.update({ where: { id }, data });
  }
}
`;
fs.writeFileSync('src/category/category.service.ts', categoryServiceCode);

let categoryControllerCode = fs.readFileSync('src/category/category.controller.ts', 'utf8');
categoryControllerCode = categoryControllerCode.replace(/CreateCategoryDto/g, 'any').replace(/UpdateCategoryDto/g, 'any');
fs.writeFileSync('src/category/category.controller.ts', categoryControllerCode);

let categoryModuleCode = fs.readFileSync('src/category/category.module.ts', 'utf8');
categoryModuleCode = categoryModuleCode.replace('providers: [CategoryService]', 'providers: [CategoryService, PrismaService]');
categoryModuleCode = categoryModuleCode.replace(`import { CategoryService } from './category.service';`, `import { CategoryService } from './category.service';\nimport { PrismaService } from '../prisma/prisma.service';`);
fs.writeFileSync('src/category/category.module.ts', categoryModuleCode);

// 3. Menu Service & Controller
const menuServiceCode = `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    // Look up categoryId by category name since frontend sends category name
    let categoryId = null;
    if (data.category) {
      const cat = await this.prisma.category.findUnique({ where: { name: data.category }});
      if (cat) categoryId = cat.id;
    }
    
    // If we couldn't find the category, link to a default or skip
    if (!categoryId) {
       const defaultCat = await this.prisma.category.findFirst();
       categoryId = defaultCat ? defaultCat.id : 1;
    }

    const { category, ...itemData } = data; // Remove category string

    return this.prisma.menuItem.create({
      data: {
        ...itemData,
        price: parseFloat(itemData.price.replace('₹', '') || 0),
        tax: itemData.tax ? parseFloat(itemData.tax) : null,
        prepTime: itemData.prepTime ? parseInt(itemData.prepTime) : null,
        categoryId
      }
    });
  }

  findAll() {
    return this.prisma.menuItem.findMany({ include: { category: true } });
  }

  async update(id: number, data: any) {
    const { category, categoryId, id: itemId, ...itemData } = data;
    return this.prisma.menuItem.update({
      where: { id },
      data: {
        ...itemData,
        price: parseFloat(String(itemData.price).replace('₹', '') || "0"),
        tax: itemData.tax ? parseFloat(itemData.tax) : null,
        prepTime: itemData.prepTime ? parseInt(itemData.prepTime) : null,
      }
    });
  }
}
`;
fs.writeFileSync('src/menu/menu.service.ts', menuServiceCode);

let menuControllerCode = fs.readFileSync('src/menu/menu.controller.ts', 'utf8');
menuControllerCode = menuControllerCode.replace(/CreateMenuDto/g, 'any').replace(/UpdateMenuDto/g, 'any');
fs.writeFileSync('src/menu/menu.controller.ts', menuControllerCode);

let menuModuleCode = fs.readFileSync('src/menu/menu.module.ts', 'utf8');
menuModuleCode = menuModuleCode.replace('providers: [MenuService]', 'providers: [MenuService, PrismaService]');
menuModuleCode = menuModuleCode.replace(`import { MenuService } from './menu.service';`, `import { MenuService } from './menu.service';\nimport { PrismaService } from '../prisma/prisma.service';`);
fs.writeFileSync('src/menu/menu.module.ts', menuModuleCode);

// 4. Enable CORS in main.ts
let mainCode = fs.readFileSync('src/main.ts', 'utf8');
mainCode = mainCode.replace('await NestFactory.create(AppModule);', 'await NestFactory.create(AppModule, { cors: true });');
fs.writeFileSync('src/main.ts', mainCode);

console.log('Backend APIs setup successfully.');
