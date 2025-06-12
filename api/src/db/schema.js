import { pgTable, serial, text, real, integer, date, varchar } from "drizzle-orm/pg-core";

// Inventory Items
export const inventory_items = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  expiration_date: date("expiration_date"),
  barcode: text("barcode"),
  category: text("category")
});

// Shopping List Items
export const shopping_list_items = pgTable("shopping_list_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  target_store: text("target_store"),
  barcode: text("barcode"),
  linked_inventory_item_id: integer("linked_inventory_item_id")
});

// Recipes
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  source: text("source")
});

// Recipe Ingredients
export const recipe_ingredients = pgTable("recipe_ingredients", {
  id: serial("id").primaryKey(),
  recipe_id: integer("recipe_id").notNull(),
  name: text("name").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  linked_inventory_item_id: integer("linked_inventory_item_id")
});