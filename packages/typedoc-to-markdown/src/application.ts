import * as path from 'path';

import {
  Application,
  ArgumentsReader,
  ParameterType,
  ProjectReflection,
  TSConfigReader,
  TypeDocReader,
} from 'typedoc';

import { Page, Theme } from './types';

export class MarkdownApplication extends Application {
  constructor(isCli = false) {
    super();

    if (isCli) {
      this.options.addReader(new ArgumentsReader(0));
    }
    this.options.addReader(new TypeDocReader());
    this.options.addReader(new TSConfigReader());
    if (isCli) {
      this.options.addReader(new ArgumentsReader(300));
    }

    this.options.addDeclaration({
      help: '',
      name: 'hideBreadcrumbs',
      type: ParameterType.Boolean,
      defaultValue: false,
    });

    this.options.addDeclaration({
      help: '',
      name: 'publicPath',
      type: ParameterType.String,
    });

    this.options.addDeclaration({
      help: '',
      name: 'namedAnchors',
      type: ParameterType.Boolean,
      defaultValue: false,
    });

    this.options.addDeclaration({
      help: '',
      name: 'allReflectionsHaveOwnDocument',
      type: ParameterType.Boolean,
      defaultValue: false,
    });
  }

  generateMarkdown(
    project: ProjectReflection,
    outputDirectory: string,
    theme: Theme,
  ) {
    outputDirectory = path.resolve(outputDirectory);
    theme.getPages().forEach((page: Page) => {
      /* fs.outputFileSync(
        outputDirectory + '/' + page.url,
        templates[page.template]({ page, project, settings: theme.settings }),
      );*/
    });

    this.logger.success(
      '[typedoc-plugin-markdown] Docs generated at %s',
      outputDirectory,
    );
  }
}
