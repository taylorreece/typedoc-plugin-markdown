import * as path from 'path';

import * as tmp from 'tmp';
import {
  DeclarationReflection,
  ProjectReflection,
  Renderer,
  TSConfigReader,
  TypeDocReader,
} from 'typedoc';

import { MarkdownApplication } from '../src/application';

tmp.setGracefulCleanup();

export class TestApp {
  app: MarkdownApplication;
  project: ProjectReflection;
  renderer: Renderer;

  outDir: string;
  tmpobj: tmp.DirResult;
  entryPoints: string[];

  constructor(entryPoints?: string[]) {
    this.app = new MarkdownApplication();
    this.entryPoints = entryPoints
      ? entryPoints.map((inputFile: string) =>
          path.join(__dirname, './stubs/src/' + inputFile),
        )
      : ['./test/stubs/src'];
    this.app.options.addReader(new TypeDocReader());
    this.app.options.addReader(new TSConfigReader());
  }

  bootstrap(options: any = {}) {
    this.app.bootstrap({
      logger: 'none',
      entryPoints: this.entryPoints,
      tsconfig: path.join(__dirname, 'stubs', 'tsconfig.json'),
      ...options,
    });
    this.project = this.app.convert();
    this.renderer = this.app.renderer;
    this.tmpobj = tmp.dirSync();
  }

  getSettings() {
    return {
      primaryEntryPoint: 'README.md',
      secondaryEntryPoint: 'modules.md',
      anchorPattern: '%s',
    };
  }

  getBreadcrumbsModel() {
    return this.project.findReflectionByName('Breadcrumbs');
  }

  findModule(name: string) {
    return this.project.children.find(
      (child) => child.name.replace(/\"/g, '') === name,
    );
  }

  findEntryPoint() {
    return this.project;
  }

  findReflection(name: string) {
    return this.project.findReflectionByName(name) as DeclarationReflection;
  }
}
