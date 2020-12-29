import * as path from 'path';

import { LoadContext } from '@docusaurus/types';
import { MarkdownApplication } from 'typedoc-to-markdown/dist/application';
import { createTheme } from 'typedoc-to-markdown/dist/theme';

import { writeSidebar } from './sidebar';
import { PluginOptions } from './types';

const DEFAULT_PLUGIN_OPTIONS: PluginOptions = {
  id: 'default',
  docsRoot: 'docs',
  out: 'api',
  sidebar: {
    fullNames: false,
    sidebarFile: 'typedoc-sidebar.js',
    globalsLabel: 'Index',
    readmeLabel: 'Readme',
  },
  globalsTitle: undefined,
  readmeTitle: undefined,
};

const apps: string[] = [];

export default async function pluginDocusaurus(
  context: LoadContext,
  opts: Partial<PluginOptions>,
) {
  const { siteDir } = context;

  /**
   * Configure options
   */
  const options = {
    ...DEFAULT_PLUGIN_OPTIONS,
    ...opts,
    ...(opts.sidebar && {
      sidebar: {
        ...DEFAULT_PLUGIN_OPTIONS.sidebar,
        ...opts.sidebar,
      },
    }),
  };

  // Initialize and build app
  if (!apps.includes(options.id)) {
    apps.push(options.id);
    const app = new MarkdownApplication();

    // TypeDoc options
    const typedocOptions = Object.keys(options).reduce((option, key) => {
      if (![...['id'], ...Object.keys(DEFAULT_PLUGIN_OPTIONS)].includes(key)) {
        option[key] = options[key];
      }
      return option;
    }, {});

    // bootstrap TypeDoc app
    app.bootstrap(typedocOptions);

    // return the generated reflections
    const project = app.convert();

    // if project is undefined typedoc has a problem - error logging will be supplied by typedoc.
    if (!project) {
      return;
    }

    // construct outputDirectory path
    const outputDirectory = path.resolve(
      siteDir,
      options.docsRoot,
      options.out,
    );

    // get pages and navigation
    const { getPages, getNavigation } = createTheme(project, app.options);

    // generate the static docs
    app.generateMarkdown(project, outputDirectory, getPages());

    // write the sidebar (if applicable)
    if (options.sidebar) {
      writeSidebar(
        false,
        siteDir,
        options.out,
        options.sidebar,
        getNavigation(),
      );
    }
  }

  // we need to generate the sidebar before any available lifecycle apis
  return {
    name: 'docusaurus-plugin-typedoc',
  };
}
