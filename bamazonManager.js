
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

  password: "",
  database: "bamazon"
});

//connect to database
connection.connect(function(err) {
  if (err) {
    throw err;
    console.log("\nUnable to connect to ACME Enterprises.".bold.red);
  } 
  // console.log("connected as id " + connection.threadId);
  console.log("\nWelcome to ACME Enterprises Inventory Management System!\n".bold.green)
  managerMenu();
});

//function to display inventory
function displayInventory() {
  //retrieving all fields
  connection.query("SELECT * FROM products", function(err, res) {
  if (err) {
    throw err;
    console.log("Unable to connect to Inventory Management System.\n".red);
  } 
    console.log("\nCurrent Inventory:\n".bold.cyan);
    //reset table so it is refreshed each time function is called
    tto.reset();
    //using terminal-table-output package for formatting, first line is header
    tto.pushrow(["item_id", "product_name", "department_name", "price", "stock_quantity"]).line();
    for(i = 0; i < res.length; i++) {
      //passing in table data retrieved with query, row by row
      tto.pushrow([res[i].item_id,res[i].product_name,res[i].department_name,res[i].price,res[i].stock_quantity]);
      //once final row has been read in, print to console
      if(i === res.length - 1) {
        tto.print(true);
      }
    }
  //calling manager menu function
  managerMenu();
  });
  
};

//function to search for and print low inventory items
function lowInventory() {
  //select all fields for products whose quantity is less than 5
  connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
  if (err) {
    throw err;
    console.log("Unable to connect to Inventory Management System.\n".red);
  } 
    console.log("\nLow Inventory:\n".bold.red);
    //reset table so it is refreshed each time function is called
    tto.reset();
    //using terminal-table-output package for formatting, first line is header
    tto.pushrow(["item_id", "product_name", "department_name", "price", "stock_quantity"]).line();
    for(i = 0; i < res.length; i++) {
      //passing in table data retrieved with query, row by row
      tto.pushrow([res[i].item_id,res[i].product_name,res[i].department_name,res[i].price,res[i].stock_quantity]);
      //once final row has been read in, print to console
      if(i === res.length - 1) {
        tto.print(true);
      }
    }
  //calling manager menu function
  managerMenu();
  });
};

//function to prompt manager with possible actions to take on inventory
//each time an action is taken, the application will return to this menu to ask manager for next action
function managerMenu() {

    inquirer
    .prompt([
      {
        type: "list",
        message: "Please select from the following options:",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit Inventory Management"],
        name: "action",
    }
    ])
    .then(function(inquirerResponse) {
     
      switch (inquirerResponse.action) {
      case "View Products for Sale":
      displayInventory();
      
      break;

      case "View Low Inventory":
      lowInventory();
      
      break;

      case "Add to Inventory":
      addInventory();
      
      break;

      case "Add New Product":
      addProduct();

      break;

      case "Exit Inventory Management":
        console.log("Exiting Inventory Management...Goodbye!".bold.yellow);
        //only end connection when manager chooses to from main menu
        connection.end(); 
      break;

      }
      
    });
};

//fucntion to increase inventory by item
function addInventory() {

  inquirer
  .prompt([
    {
      type: "input",
      message: "\nPlease enter the item ID of the product you would like to restock.\n",
      name: "product", 
    },
    {
      type: "input",
      message: "\nWhat quantity should be added to store inventory?\n",
      name: "quantity", 
    }
    ])
    .then(function(inquirerResponse) {
      console.log("\nUpdating inventory...".bold.yellow);
      //returning current inventory quantity and name by product id selected by manager
      var query = "SELECT stock_quantity, product_name FROM products WHERE ?";
      connection.query(query, { item_id: inquirerResponse.product }, function(err, res1) {
        if (err) {
          throw err;
          console.log("\nThe Inventory Management System is experiencing technical difficulties.\n".bold.red);
        } 
        //add new quantity entered by manager to existing inventory
        var newQuantity = res1[0].stock_quantity + parseInt(inquirerResponse.quantity);
        //updating quantity in inventory table by product id
        connection.query("UPDATE products SET ? WHERE ?",
         [
          {
            stock_quantity: newQuantity
          },
          {
            item_id: inquirerResponse.product
          }
        ], function(err, res2) {
        if (err) {
          throw err;
          console.log("\nThe Inventory Management System is experiencing technical difficulties.\n".bold.red);
        } 
          //notify manager of successful restocking
          console.log("\nYou have successfully restocked ".bold.magenta + res1[0].product_name + ".\n".bold.magenta);
          console.log("\nTotal inventory for this item is now ".bold.magenta + newQuantity + ".\n".bold.magenta);
          //call manager menu function
          managerMenu();
      });


    });
  
   });
};

//function to add new product to catalog
function addProduct() {

  //lead manager through required fields to update database
  inquirer
  .prompt([
    {
      type: "input",
      message: "\nPlease enter the name of the product you would like to add to store inventory.\n",
      name: "name", 
    },
    {
      type: "input",
      message: "\nIn which department will this product be sold?\n",
      name: "dept", 
    },
    {
      type: "input",
      message: "\nWhat is the product's selling price?\n",
      name: "price", 
    },
    {
      type: "input",
      message: "\nHow many units should be added to store inventory?.\n",
      name: "quantity", 
    }
    ])
    .then(function(inquirerResponse) {
      console.log("\nUpdating inventory...".bold.yellow);
          //add new product row to products table with the following values entered by manager
          connection.query("INSERT INTO products SET ?",     
          {
            product_name: inquirerResponse.name,
            department_name: inquirerResponse.dept,
            price: parseFloat(inquirerResponse.price).toFixed(2),
            stock_quantity: inquirerResponse.quantity
          }, function(err, res1) {
        if (err) {
          throw err;
          console.log("\nThe Inventory Management System is experiencing technical difficulties.\n".bold.red);
        } 
          //retrive values from inventory database to verify that update was successful
          var query = "SELECT * FROM products WHERE ?";
          connection.query(query, { product_name: inquirerResponse.name }, function(err, res2) {
            if (err) {
              throw err;
              console.log("\nThe Inventory Management System is experiencing technical difficulties.\n".bold.red);
            } 
            //notify manager that product was successfully added to inventory
            console.log("\nYou have successfully stocked: ".bold.magenta + res2[0].product_name + ".\n".bold.magenta);
            console.log("\nQuantity: ".bold.magenta + res2[0].stock_quantity + ".\n".bold.magenta);
            console.log("\nPrice: ".bold.magenta + res2[0].price + ".\n".bold.magenta);
            console.log("\nDepartment: ".bold.magenta + res2[0].department_name + ".\n".bold.magenta);
            //calling manager menu function
            managerMenu();
         });
      });
    
    });
};
