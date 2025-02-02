import * as fs from 'fs';
import * as path from 'path';

import ProgressBar from 'progress';
import {
  Application,
  MixedDeclarationOption,
  ParameterType,
  ProjectReflection,
  ReflectionKind,
  StringDeclarationOption,
  TSConfigReader,
  TypeDocReader,
  UrlMapping,
} from 'typedoc';
import { GroupPlugin } from 'typedoc/dist/lib/converter/plugins';
import { RendererEvent } from 'typedoc/dist/lib/output/events';
import { TemplateMapping } from 'typedoc/dist/lib/output/themes/DefaultTheme';

import { getPluginOptions } from './options';
import { PluginOptions } from './types';

const CATEGORY_POSITION = {
  [ReflectionKind.Module]: 1,
  [ReflectionKind.Namespace]: 1,
  [ReflectionKind.Enum]: 2,
  [ReflectionKind.Class]: 3,
  [ReflectionKind.Interface]: 4,
  [ReflectionKind.TypeAlias]: 5,
  [ReflectionKind.Variable]: 6,
  [ReflectionKind.Function]: 7,
  [ReflectionKind.ObjectLiteral]: 8,
};

export const bootstrap = (app: Application, opts: Partial<PluginOptions>) => {
  addTypedocReaders(app);
  addTypedocDeclarations(app);
  app.renderer.render = render;
  app.bootstrap({ ...getPluginOptions(opts), theme: path.resolve(__dirname) });
  return app.options.getRawValues() as PluginOptions;
};

async function render(project: ProjectReflection, outputDirectory: string) {
  if (!this.prepareTheme() || !this.prepareOutputDirectory(outputDirectory)) {
    return;
  }

  const output = new RendererEvent(
    RendererEvent.BEGIN,
    outputDirectory,
    project,
  );

  const options: PluginOptions = this.application.options.getRawValues();

  output.settings = options;
  output.urls = this.theme!.getUrls(project);

  if (output.urls) {
    const bar = new ProgressBar('Rendering [:bar] :percent', {
      total: output.urls.length,
      width: 40,
    });
    this.trigger(output);
    if (!output.isDefaultPrevented) {
      output.urls?.forEach((mapping: UrlMapping, i) => {
        this.renderDocument(output.createPageEvent(mapping));
        bar.tick();
      });
      this.trigger(RendererEvent.END, output);
    }

    writeCategoryYaml(
      outputDirectory,
      options.sidebar.categoryLabel,
      options.sidebar.position,
    );

    Object.keys(groupUrlsByKind(output.urls)).forEach((group) => {
      const kind = parseInt(group);
      const mapping = this.theme.mappings.find((mapping: TemplateMapping) =>
        mapping.kind.includes(kind),
      );
      if (mapping) {
        writeCategoryYaml(
          outputDirectory + '/' + mapping.directory,
          GroupPlugin.getKindPlural(kind),
          CATEGORY_POSITION[kind],
        );
      }
    });
  }
}

const writeCategoryYaml = (
  categoryPath: string,
  label: string,
  position: number | null,
) => {
  const yaml: string[] = [`label: "${label}"`];
  if (position !== null) {
    yaml.push(`position: ${position}`);
  }
  if (fs.existsSync(categoryPath)) {
    fs.writeFileSync(categoryPath + '/_category_.yml', yaml.join('\n'));
  }
};

const groupUrlsByKind = (urls: UrlMapping[]) => {
  return urls.reduce(
    (r, v, i, a, k = v.model.kind) => ((r[k] || (r[k] = [])).push(v), r),
    {},
  );
};

const addTypedocReaders = (app: Application) => {
  app.options.addReader(new TypeDocReader());
  app.options.addReader(new TSConfigReader());
};

const addTypedocDeclarations = (app: Application) => {
  app.options.addDeclaration({
    name: 'id',
  } as StringDeclarationOption);

  app.options.addDeclaration({
    name: 'docsRoot',
  } as StringDeclarationOption);

  app.options.addDeclaration({
    name: 'siteDir',
  } as MixedDeclarationOption);

  app.options.addDeclaration({
    name: 'globalsTitle',
  } as StringDeclarationOption);

  app.options.addDeclaration({
    name: 'readmeTitle',
  } as StringDeclarationOption);

  app.options.addDeclaration({
    name: 'sidebar',
    type: ParameterType.Mixed,
  } as MixedDeclarationOption);
};
