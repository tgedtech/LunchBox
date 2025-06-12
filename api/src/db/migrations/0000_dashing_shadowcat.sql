CREATE TABLE IF NOT EXISTS "inventory_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"quantity" real NOT NULL,
	"unit" text NOT NULL,
	"expiration_date" date,
	"barcode" text,
	"category" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipe_ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipe_id" integer NOT NULL,
	"name" text NOT NULL,
	"quantity" real NOT NULL,
	"unit" text NOT NULL,
	"linked_inventory_item_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"source" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shopping_list_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"quantity" real NOT NULL,
	"unit" text NOT NULL,
	"target_store" text,
	"barcode" text,
	"linked_inventory_item_id" integer
);
