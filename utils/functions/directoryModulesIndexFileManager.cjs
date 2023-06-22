const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Specify the directories where your modules are located
const moduleDirectories = ['./middleware', './routes', './controllers', './models', './db/connections', './errors'];

// Function to generate the index.js file
const generateIndexFile = () => {
  // Read the module files from each directory
  moduleDirectories.forEach(moduleDirectory => {
    fs.readdir(moduleDirectory, (err, files) => {
      if (err) {
        console.error('Error reading module directory:', err);
        return;
      }

      // Filter out non-JavaScript files and index.js
      const moduleFiles = files.filter(file => file.endsWith('.js') && file !== 'index.js');

      // Generate the export statements
      const exportStatements = moduleFiles.map(file => {
        const moduleName = path.parse(file).name;
        return `const ${moduleName} = require('./${moduleName}');`;
      });

      // Create the index.js content
      const indexContent = `${exportStatements.join('\n')}\n\nmodule.exports = {${moduleFiles.map(file => path.parse(file).name).join(', ')}};`;

      // Write the index.js file
      fs.writeFile(path.join(moduleDirectory, 'index.js'), indexContent, err => {
        if (err) {
          console.error('Error writing index.js file:', err);
          return;
        }
        // console.log(`index.js file updated successfully in ${moduleDirectory}!`);
      });
    });
  });
};

// Watch for changes in the module directories
moduleDirectories.forEach(moduleDirectory => {
  chokidar.watch(moduleDirectory).on('all', () => {
    generateIndexFile();
  });
});

// Generate the initial index.js files
generateIndexFile();
