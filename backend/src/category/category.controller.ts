import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';



@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: any) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return null;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: any) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Post(':id/subcategory')
  addSubcategory(@Param('id') id: string, @Body() body: { name: string }) {
    return this.categoryService.addSubcategory(+id, body.name);
  }

  @Delete(':id/subcategory/:name')
  removeSubcategory(@Param('id') id: string, @Param('name') name: string) {
    return this.categoryService.removeSubcategory(+id, name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return null;
  }
}
