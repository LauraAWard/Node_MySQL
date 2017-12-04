
//include npm packages
var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require("colors");
var tto = require('terminal-table-output').create();

//mySQL connection data
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "***REMOVED***",
  database: "bamazon"
});

//defining variables globally so accessible to all functions
var inventoryQuantity = 0;
var inventoryName = "";
var inventoryPrice = 0;

//connect to database
connection.connect(function(err) {
  if (err) {
    throw err;
    console.log("\nUnable to connect to ACME Enterprises.".bold.red);
  } 
  // console.log("connected as id " + connection.threadId);
  console.log("\nWelcome to ACME Enterprises!".bold.green)
  displayProducts();
});

//function to display products
function displayProducts() {
  //only retrieving fields pertininet to customers
  connection.query("SELECT item_id, product_name, price FROM products", function(err, res) {
  if (err) {
    throw err;
    console.log("We're sorry, our store is experiencing technical difficulties. \nPlease come back later!".red);
  } 
    console.log("\nPlease peruse our fine products:\n".bold.cyan);
    //using terminal-table-output package for formatting, first line is header
    tto.pushrow(["item_id", "product_name", "price"]).line();
    for(i = 0; i < res.length; i++) {
      //passing in table data retrieved with query, row by row
      tto.pushrow([res[i].item_id,res[i].product_name,res[i].price]);
      //once final row has been read in, print to console
      if(i === res.length - 1) {
        tto.print(true);
      }
    }
    //calling order intake function
    orderIntake();  
  });

};

//function to intake customer order
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
      //calling checkInventory function, passing the values entered by customer
      checkInventory(inquirerResponse.product, inquirerResponse.quantity);

    });

};

//function to check inventory
function checkInventory(customerProduct, customerQuantity) {
  //retrieving inventory quantity, product name and price, based on product id
  var query = "SELECT stock_quantity, product_name, price FROM products WHERE ?";
  connection.query(query, { item_id: customerProduct }, function(err, res) {
  if (err) {
    throw err;
    console.log("\nWe're sorry, our store is experiencing technical difficulties. \nPlease come back later!".bold.red);
  } 
    inventoryQuantity = res[0].stock_quantity;
    inventoryName = res[0].product_name;
    inventoryPrice = res[0].price;

    //if customer orders more than is available in inventory, notify customer that order cannot be placed
    if(inventoryQuantity < customerQuantity) {
      console.log("\nWe're sorry, we do not have ".bold.yellow + customerQuantity + " " + inventoryName + " in stock.".bold.yellow);

      //ask customer if they would like to place a different order
      inquirer
      .prompt([
        {
          type: "confirm",
          message: "\nWould you like to place another order?\n",
          name: "newOrder" 
      }
      ])
      .then(function(inquirerResponse) {
        //if customer wants to place another order, display product catalog again and prompt for new order
        if(inquirerResponse.newOrder) {
          console.log("\nPlease peruse our fine products:\n".bold.cyan);
          tto.print(true);
          orderIntake();
         // displayProducts();
        }
        //if customer does not want to place another order, end connection
        else {
          console.log("We're sorry we could not fulfill your order.  Please visit us again soon.".bold.blue);
          connection.end(); 
        }
      });
    }
    //if the store inventory is sufficient to fulfill the customer's order, process the order
    else if(inventoryQuantity >= customerQuantity) {
      placeOrder(customerProduct, customerQuantity, inventoryPrice);
    }
  });
};

//function to process the customer's order
function placeOrder(product, quantity) {
  
  //calculate the remaining inventory after customer order fulfilled
  var newQuantity = inventoryQuantity - quantity;
  //calculate the total cost of the customer's order
  var cost = quantity * inventoryPrice;
  //update the inventory database with remaining quantity of product
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
    //notify customer that order was sucessful, give order info, and end connectiopn
    console.log("\nYour order for ".bold.magenta + quantity + " " + inventoryName + " has been placed successfully.\n".bold.magenta);
    console.log("\nThe total cost of your order is $".bold.magenta + cost + ".\n".bold.magenta);
    console.log("\nThank you for your business, please visit us again soon.\n".bold.magenta);
  });
    connection.end();
};