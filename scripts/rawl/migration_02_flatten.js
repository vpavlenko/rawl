const fs = require("fs");

// Path to the JSON file
const filePath = "../../src/corpus/analyses.json";

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

    const flattenedAnalyses = {};

    // Traverse and modify the data
    Object.keys(jsonData).forEach((artist) => {
      Object.keys(jsonData[artist]).forEach((song) => {
        Object.keys(jsonData[artist][song]).forEach((version) => {
          flattenedAnalyses[`c/${artist}/${song}`] =
            jsonData[artist][song][version];
        });
      });
    });

    // Convert the modified data back to a JSON string
    const modifiedData = JSON.stringify(flattenedAnalyses, null, 2);

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
