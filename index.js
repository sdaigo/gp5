#!/usr/bin/env node
const fs = require('fs')
const os = require('os')
const { promisify } = require('util')
const chalk = require('chalk')
const inquirer = require('inquirer')

const questions = [
  {
    type: 'input',
    name: 'name',
    message: 'sketch name',
    validate: value => {
      if (!value.match(/^[a-zA-Z1-9_]+$/)) {
        return 'Sketch name should only contain letters, numbers and "_"'
      }

      return true
    },
  },
]

const taskJson = {
  version: '0.1.0',
  command: 'processing-java',
  isShellCommand: true,
  args: [
    '--force',
    '--sketch=${workspaceRoot}',
    '--output=${workspaceRoot}' +
      (os.platform() === 'win32' ? '\\out' : '/out'),
    '--run',
  ],
}

const initialSketch = name => `void setup() {
  size(640, 480);
}

void draw() {
  background(255);
  fill(30);
  textSize(18);
  text("${name}", 20, height/2);
}`

const CWD = process.cwd()
const sketchDir = name => `${CWD}/${name}`
const vsPath = name => `${CWD}/${name}/.vscode`
const taskPath = name => `${CWD}/${name}/.vscode/tasks.json`

const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

function abort(e) {
  console.error(chalk.red(e))
  process.exit(1)
}

function createSketchDir(name) {
  return mkdir(sketchDir(name))
}

function createTaskJson(name) {
  return writeFile(taskPath(name), JSON.stringify(taskJson, null, 2))
}

function createVSTask(name) {
  return mkdir(vsPath(name))
}

function createInitialSketch(name) {
  return writeFile(`${sketchDir(name)}/${name}.pde`, initialSketch(name))
}

async function run() {
  const { name } = await inquirer.prompt(questions)

  try {
    await createSketchDir(name)
    await createVSTask(name)
    await createTaskJson(name)
    await createInitialSketch(name)
  } catch (e) {
    abort(e)
  }
}

run()
