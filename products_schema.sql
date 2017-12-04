DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon; 

USE bamazon;

CREATE TABLE products (

item_id int NOT NULL auto_increment,
product_name varchar(100) NULL,
department_name varchar(100) NULL,
price decimal(8,2) NULL,
stock_quantity int NULL,

PRIMARY KEY (item_id)

);

SELECT * FROM products;


insert into products (product_name, department_name, price, stock_quantity)
values ("Talky Toaster", "Housewares", 29.95, 10);

insert into products (product_name, department_name, price, stock_quantity)
values ("Prickles Porcupine", "Soft Toys", 25.00, 12);

insert into products (product_name, department_name, price, stock_quantity)
values ("Fluffy Bunny Slippers", "Loungewear", 34.99, 4);

insert into products (product_name, department_name, price, stock_quantity)
values ("Piddles the Bear", "Soft Toys", 32.50, 20);

insert into products (product_name, department_name, price, stock_quantity)
values ("Bass-o-Matic", "Housewares", 59.99, 26);

insert into products (product_name, department_name, price, stock_quantity)
values ("Polyester Speed Suit", "Loungewear", 44.50, 5);

insert into products (product_name, department_name, price, stock_quantity)
values ("Flobee", "Housewares", 129.95, 45);

insert into products (product_name, department_name, price, stock_quantity)
values ("Baby Barfs-A-Lot", "Soft Toys", 39.95, 7);

insert into products (product_name, department_name, price, stock_quantity)
values ("Tickle Me Tarantula", "Soft Toys", 19.95, 2);

insert into products (product_name, department_name, price, stock_quantity)
values ("12-Pack Assorted Zipper Pulls", "Notions", 14.98, 6);

insert into products (product_name, department_name, price, stock_quantity)
values ("Stretchrite Elastic 144-Yard Spool", "Notions", 20.99, 12);

insert into products (product_name, department_name, price, stock_quantity)
values ("Qwik-Dry Tropical-Print MuuMuu", "Loungewear", 52.98, 5);

update products
set stock_quantity = 5
where item_id = 6;

SELECT * FROM bamazon.products;