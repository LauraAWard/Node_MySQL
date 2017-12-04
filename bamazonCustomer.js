

var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require("colors");
var tto = require('terminal-table-output').create();

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "***REMOVED***",
  database: "bamazon"
});

var inventoryQuantity = 0;
var inventoryName = "";
var inventoryPrice = 0;


connection.connect(function(err) {
  if (err) {
    throw err;
    console.log("\nUnable to connect to ACME Enterprises.".bold.red);
  } 
  // console.log("connected as id " + connection.threadId);
  console.log("\nWelcome to ACME Enterprises!".bold.green)
  displayProducts();
});

function displayProducts() {
  connection.query("SELECT item_id, product_name, price FROM products", function(err, res) {
  if (err) {
    throw err;
    console.log("We're sorry, our store is experiencing technical difficulties. \nPlease come back later!".red);
  } 
    console.log("\nPlease peruse our fine products:\n".bold.cyan);
    tto.pushrow(["item_id", "product_name", "price"]).line();
    for(i = 0; i < res.length; i++) {
      tto.pushrow([res[i].item_id,res[i].product_name,res[i].price]);
      if(i === res.length - 1) {
        tto.print(true);
      }
    }
    orderIntake();  
  });

};

function orderIntake() {

    inquirer
    .prompt([
      {
        type: "input",
        message: "\nPlease enter the item ID of the product you would like to buy.\n",
        name: "product" 
    },
    {
        type: "input",
        message: "\nHow many of those would you like?.\n",
        name: "quantity" 
    }
    ])
    .then(function(inquirerResponse) {
      console.log("\nChecking inventory...".bold.yellow);
      checkInventory(inquirerResponse.product, inquirerResponse.quantity);

    });

};

function checkInventory(customerProduct, customerQuantity) {
  var query = "SELECT stock_quantity, product_name, price FROM products WHERE ?";
  connection.query(query, { item_id: customerProduct }, function(err, res) {
  if (err) {
    throw err;
    console.log("\nWe're sorry, our store is experiencing technical difficulties. \nPlease come back later!".bold.red);
  } 
    inventoryQuantity = res[0].stock_quantity;
    inventoryName = res[0].product_name;
    inventoryPrice = res[0].price;

    if(inventoryQuantity < customerQuantity) {
      console.log("\nWe're sorry, we do not have ".bold.yellow + customerQuantity + " " + inventoryName + " in stock.".bold.yellow);

      inquirer
      .prompt([
        {
          type: "confirm",
          message: "\nWould you like to place another order?\n",
          name: "newOrder" 
      }
      ])
      .then(function(inquirerResponse) {
        if(inquirerResponse.newOrder) {
          console.log("\nPlease peruse our fine products:\n".bold.cyan);
          tto.print(true);
          orderIntake();
         // displayProducts();
        }
        else {
          console.log("We're sorry we could not fulfill your order.  Please visit us again soon.".bold.blue);
          connection.end(); 
        }
      });
    }
    else if(inventoryQuantity >= customerQuantity) {
      placeOrder(customerProduct, customerQuantity, inventoryPrice);
    }
  });
};

function placeOrder(product, quantity) {
  
  var newQuantity = inventoryQuantity - quantity;
  var cost = quantity * inventoryPrice;
  connection.query("UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: newQuantity
      },
      {
        item_id: product
      }
    ], function(err, res) {
  if (err) {
    throw err;
    console.log("We're sorry, our store is experiencing technical difficulties. \nPlease come back later!".bold.red);
  } 
    console.log("\nYour order for ".bold.magenta + quantity + " " + inventoryName + " has been placed successfully.\n".bold.magenta);
    console.log("\nThe total cost of your order is $".bold.magenta + cost + ".\n".bold.magenta);
    console.log("\nThank you for your business, please visit us again soon.\n".bold.magenta);
  });
    connection.end();
};