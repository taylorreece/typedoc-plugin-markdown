#!/usr/bin/env node

const { ArgumentsReader, TSConfigReader, TypeDocReader } = require('typedoc');

const { MarkdownApplication } = require('../dist/application');
const { createTheme, makeTheme } = require('../dist/theme');

const ExitCodes = {
  Ok: 0,
  OptionError: 1,
  NoEntryPoints: 2,
  CompileError: 3,
  OutputError: 4,
};

const app = new MarkdownApplication(true);

app.bootstrap();

run(app)
  .then(process.exit)
  .catch((error) => {
    console.error('TypeDoc exiting with unexpected error:');
    console.error(error);
  });

async function run(app) {
  if (app.logger.hasErrors()) {
    return ExitCodes.OptionError;
  }

  if (app.options.getValue('entryPoints').length === 0) {
    app.logger.error('No entry points provided');
    return ExitCodes.NoEntryPoints;
  }

  const project = app.convert();
  if (!project) {
    return ExitCodes.CompileError;
  }

  const out = app.options.getValue('out');
  if (out) {
    makeTheme(project);
    app.generateMarkdown(project, out, createTheme(project, app.options));
  }

  if (app.logger.hasErrors()) {
    return ExitCodes.OutputError;
  }
  return ExitCodes.Ok;
}
