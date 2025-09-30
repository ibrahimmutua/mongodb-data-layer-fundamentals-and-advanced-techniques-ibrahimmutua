const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017"; // update if you're using Atlas
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    // choose your DB and collection
    const db = client.db("plp_boostore");
    const books = db.collection("books");

    
    // Task 2: Basic Queries
    
    console.log("\n--- Basic Queries ---");

    // Find all books in a specific genre
    const programmingBooks = await books.find({ genre: "Programming" }).toArray();
    console.log("Programming Books:", programmingBooks);

    // Find books published after a certain year
    const recentBooks = await books.find({ published_year: { $gt: 2010 } }).toArray();
    console.log("Books published after 2010:", recentBooks);

    // Find books by a specific author
    const rowlingBooks = await books.find({ author: "J.K. Rowling" }).toArray();
    console.log("Books by J.K. Rowling:", rowlingBooks);

    // Update the price of a specific book
    const updateResult = await books.updateOne(
      { title: "1984" },
      { $set: { price: 17.0 } }
    );
    console.log("Update Result:", updateResult.modifiedCount);

    // Delete a book by its title
    const deleteResult = await books.deleteOne({ title: "The Great Gatsby" });
    console.log("Delete Result:", deleteResult.deletedCount);

    
    // Task 3: Advanced Queries
  
    console.log("\n--- Advanced Queries ---");

    // Books in stock and published after 2010
    const stockAndRecent = await books.find({
      in_stock: true,
      published_year: { $gt: 2010 },
    }).toArray();
    console.log("In stock & after 2010:", stockAndRecent);

    // Projection: only title, author, price
    const projected = await books.find(
      {},
      { projection: { title: 1, author: 1, price: 1, _id: 0 } }
    ).toArray();
    console.log("Projection:", projected);

    // Sorting by price (ascending)
    const sortedAsc = await books.find().sort({ price: 1 }).toArray();
    console.log("Sorted by Price ASC:", sortedAsc);

    // Sorting by price (descending)
    const sortedDesc = await books.find().sort({ price: -1 }).toArray();
    console.log("Sorted by Price DESC:", sortedDesc);

    // Pagination (5 books per page)
    const page1 = await books.find().limit(5).toArray();
    console.log("Page 1:", page1);

    const page2 = await books.find().skip(5).limit(5).toArray();
    console.log("Page 2:", page2);

    
    // Task 4: Aggregation Pipelines
    
    console.log("\n--- Aggregations ---");

    // Average price by genre
    const avgByGenre = await books.aggregate([
      { $group: { _id: "$genre", avgPrice: { $avg: "$price" } } },
    ]).toArray();
    console.log("Average Price by Genre:", avgByGenre);

    // Author with the most books
    const topAuthor = await books.aggregate([
      { $group: { _id: "$author", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]).toArray();
    console.log("Author with most books:", topAuthor);

    // Group books by publication decade and count them
    const byDecade = await books.aggregate([
      {
        $group: {
          _id: {
            $concat: [
              {
                $toString: {
                  $subtract: [
                    "$published_year",
                    { $mod: ["$published_year", 10] },
                  ],
                },
              },
              "s",
            ],
          },
          count: { $sum: 1 },
        },
      },
    ]).toArray();
    console.log("Books grouped by decade:", byDecade);

    
    // Task 5: Indexing
    
    console.log("\n--- Indexing ---");

    // Index on title
    const index1 = await books.createIndex({ title: 1 });
    console.log("Created Index:", index1);

    // Compound index on author + published_year
    const index2 = await books.createIndex({ author: 1, published_year: 1 });
    console.log("Created Compound Index:", index2);

    // Explain query with index
    const explainResult = await books.find({ title: "1984" }).explain("executionStats");
    console.log(
      "Explain Result for '1984':",
      JSON.stringify(explainResult.executionStats, null, 2)
    );

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
