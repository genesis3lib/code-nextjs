/**
 * Next.js Scaffolder
 *
 * Handles scaffolding Next.js projects using create-next-app CLI.
 * This scaffolder is specific to the code-nextjs module.
 *
 * @module code-nextjs/scaffolder
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Runs a command and returns a promise
 *
 * @param {string} command - Command to run
 * @param {Array} args - Command arguments
 * @param {string} workingDir - Directory to run the command in
 * @param {string} description - Description for logging
 * @returns {Promise<void>}
 */
function runCommand(command, args, workingDir, description) {
  return new Promise((resolve, reject) => {
    console.log(`🔧 ${description}...`);
    console.log(`📂 Working directory: ${workingDir}`);
    console.log(`💻 Running: ${command} ${args.join(' ')}`);

    const cmd = process.platform === 'win32' ? `${command}.cmd` : command;

    const childProcess = spawn(cmd, args, {
      cwd: workingDir,
      stdio: 'pipe',
      shell: true
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write('.');
    });

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    childProcess.on('close', (code) => {
      console.log(''); // New line after progress dots

      if (code !== 0) {
        console.error(`❌ ${description} failed with code ${code}`);
        console.error('stdout:', stdout);
        console.error('stderr:', stderr);
        return reject(new Error(`${description} failed with exit code ${code}`));
      }

      console.log(`✅ ${description} completed successfully`);
      resolve();
    });

    childProcess.on('error', (err) => {
      reject(new Error(`Failed to run ${command}: ${err.message}`));
    });
  });
}

/**
 * Runs create-next-app CLI to create a new Next.js project
 *
 * @param {string} workingDir - Directory to run the command in
 * @param {string} projectName - Name of the project to create
 * @param {Object} options - Creation options
 * @param {boolean} options.useAppRouter - Use App Router (default: true)
 * @returns {Promise<void>}
 */
function runCreateNextApp(workingDir, projectName, options = {}) {
  const args = [
    'create-next-app@latest',
    projectName,
    '--yes',         // Use defaults for all prompts (avoids interactive prompts)
    '--typescript',
    '--tailwind',
    '--eslint',
    '--src-dir',
    '--import-alias', '@/*',
    '--turbopack',   // Enable Turbopack for development
    '--skip-install', // Skip npm install - users will run it after clone
    '--disable-git'  // Skip git initialization (Genesis3 handles git)
  ];

  // App Router is default in Next.js 14+, use --app explicitly
  if (options.useAppRouter !== false) {
    args.push('--app');
  }

  return runCommand(
    'npx',
    args,
    workingDir,
    'Creating Next.js project'
  );
}

/**
 * Reads all files from a directory recursively
 *
 * @param {string} dirPath - Directory to read
 * @param {string} basePath - Base path for relative paths
 * @returns {Object} Files object with {type, content} structure
 */
function readDirectoryRecursive(dirPath, basePath = '') {
  const files = {};

  if (!fs.existsSync(dirPath)) return files;

  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    const relativePath = basePath ? path.join(basePath, item.name) : item.name;

    if (item.isDirectory()) {
      // Recursively read subdirectories
      Object.assign(files, readDirectoryRecursive(fullPath, relativePath));
    } else {
      try {
        // Check if file is binary or text
        const isBinary = /\.(png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|svg)$/i.test(item.name);

        if (isBinary) {
          // Read binary files as base64
          files[relativePath] = {
            type: 'binary',
            content: fs.readFileSync(fullPath, 'base64')
          };
        } else {
          // Read text files as UTF-8
          files[relativePath] = {
            type: 'text',
            content: fs.readFileSync(fullPath, 'utf8')
          };
        }
      } catch (err) {
        console.warn(`⚠️ Could not read file ${relativePath}: ${err.message}`);
      }
    }
  }

  return files;
}

/**
 * Removes files from the files object based on removal list
 *
 * @param {Object} files - Files object to modify
 * @param {string[]} filesToRemove - Array of file paths to remove
 * @returns {Object} Modified files object
 */
function removeFiles(files, filesToRemove) {
  if (!filesToRemove || filesToRemove.length === 0) {
    return files;
  }

  console.log('🗑️ Removing files as specified in module configuration...');

  for (const fileToRemove of filesToRemove) {
    if (files[fileToRemove]) {
      delete files[fileToRemove];
      console.log(`✅ Removed file: ${fileToRemove}`);
    } else {
      console.warn(`⚠️ File not found for removal: ${fileToRemove}`);
    }
  }

  return files;
}

/**
 * Updates package.json with additional dependencies
 *
 * @param {string} projectPath - Path to the project
 * @param {Object} dependencies - Dependencies from meta.json
 * @returns {void}
 */
function updatePackageJson(projectPath, dependencies) {
  const packageJsonPath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.warn('⚠️ package.json not found, skipping dependency update');
    return;
  }

  console.log('📝 Updating package.json with additional dependencies...');

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Merge dependencies
  if (dependencies.npm?.dependencies) {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...dependencies.npm.dependencies
    };
  }

  // Merge devDependencies
  if (dependencies.npm?.devDependencies) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...dependencies.npm.devDependencies
    };
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json updated');
}

/**
 * Main scaffolding function - called by Genesis3
 *
 * @param {Object} moduleConfig - Module meta.json configuration
 * @param {Object} context - Scaffolding context
 * @param {Object} context.project - Project information
 * @param {Object} context.module - Module instance with fieldValues
 * @param {Array} context.modules - All modules in the project
 * @returns {Promise<Object>} Files object with {type, content} structure
 */
async function scaffold(moduleConfig, context) {
  const { project, module } = context;

  // Get configuration from module field values
  const fieldValues = module.fieldValues || {};

  // Determine router type (app router is default and only option for now)
  const useAppRouter = fieldValues.routerType !== 'pages';

  console.log('🔍 Next.js parameters:', {
    useAppRouter,
    nextjsVersion: fieldValues.nextjsVersion || '15',
    projectName: project.name
  });

  // Create temporary directory for scaffolding
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genesis3-nextjs-'));
  const projectName = 'project';

  try {
    // Run create-next-app command from tempDir
    // create-next-app will create projectName directory inside tempDir
    await runCreateNextApp(tempDir, projectName, { useAppRouter });

    // create-next-app creates the project in a subdirectory with the project name
    const actualProjectPath = path.join(tempDir, projectName);

    // Update package.json with additional dependencies
    updatePackageJson(actualProjectPath, moduleConfig.dependencies || {});

    // Skip npm install - developers will run these after cloning
    console.log('⏭️  Skipping npm install (run after cloning the project)');

    // Read all generated files
    console.log('📂 Reading generated files...');
    const files = readDirectoryRecursive(actualProjectPath);

    console.log(`✅ Read ${Object.keys(files).length} files from Next.js project`);

    // Remove files specified in module configuration
    const filesToRemove = moduleConfig.generation?.files?.remove || [];
    const cleanedFiles = removeFiles(files, filesToRemove);

    console.log(`✅ Next.js project generated successfully (${Object.keys(cleanedFiles).length} files)`);

    return cleanedFiles;

  } finally {
    // Clean up temporary directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.warn(`⚠️ Could not clean up temporary directory ${tempDir}: ${err.message}`);
    }
  }
}

module.exports = {
  scaffold
};
