const fs = require("fs");

// Path to the JSON file
const filePath = "src/corpus/analyses.json";

// Function to read the JSON data, modify it, and write it back
function modifyData() {
  // Read the JSON file
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }

    // Parse the JSON data
    let jsonData = JSON.parse(data);

    // Traverse and modify the data
    Object.keys(jsonData).forEach((key) => {
      const modulations = jsonData[key].modulations;

      if (modulations) {
        // Assign modulations['1'] = modulations['1'] ?? modulations['0']
        modulations["1"] = modulations["1"] ?? modulations["0"];

        // Delete modulations['0']
        delete modulations["0"];
      }
    });

    // Convert the modified data back to a JSON string
    const modifiedData = JSON.stringify(jsonData, null, 2);

    // Write the modified data back to the file
    fs.writeFile(filePath, modifiedData, "utf8", (err) => {
      if (err) {
        console.error("Error writing the file:", err);
        return;
      }
      console.log("File has been successfully updated");
    });
  });
}

// Call the function
modifyData();
