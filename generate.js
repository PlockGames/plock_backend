#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

const flags = {
  '-s': 'shared',
  '-f': 'feature',
  '-c': 'core',
};

const appModulePath = path.join(__dirname, 'src', 'core', 'app.module.ts');

function parseArgs(args) {
  const options = {
    type: '',
    path: '',
    name: '',
  };
  let flag = null;

  args.forEach(arg => {
    if (flags[arg]) {
      flag = arg;
    } else if (!options.type) {
      options.type = arg;
    } else if (!options.name) {
      options.name = arg;
    }
  });

  if (flag) {
    options.path = flags[flag];
  }

  return options;
}

function generateResource({ type, path, name }) {
  if (!type || !path || !name) {
    console.error('Error: Asegúrate de proporcionar el tipo de recurso, el nombre del recurso y uno de los flags -s, -f, -c');
    process.exit(1);
  }

  const command = `nest g ${type} ${path}/${name}`;
  console.log(`Ejecutando comando: ${command}`);
  execSync(command, { stdio: 'inherit' });

  if (type === 'mo') {
    updateAppModule(path, name);
  }
}

function updateAppModule(modulePath, moduleName) {
  if (!fs.existsSync(appModulePath)) {
    console.error(`Error: No se encontró ${appModulePath}`);
    process.exit(1);
  }

  const appModuleContent = fs.readFileSync(appModulePath, 'utf8');
  const importStatement = `import { ${capitalize(moduleName)}Module } from '../${modulePath}/${moduleName}/${moduleName}.module';\n`;
  const moduleImport = `${capitalize(moduleName)}Module,`;

  if (!appModuleContent.includes(importStatement)) {
    const updatedContent = appModuleContent.replace(
      /(import { .*Module } from '.*';\n)+/,
      `$&${importStatement}`
    ).replace(
      /(@Module\({\n  imports: \[)([\s\S]*?)(\]\n)/,
      `$1$2  ${moduleImport}\n$3`
    );

    fs.writeFileSync(appModulePath, updatedContent, 'utf8');
    console.log(`Actualizado ${appModulePath} con ${moduleName}Module`);
  }
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const options = parseArgs(args);
generateResource(options);
