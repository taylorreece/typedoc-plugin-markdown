import {
  DeclarationReflection,
  ProjectReflection,
  ReflectionKind,
} from 'typedoc';

export interface MarkdownTheme {
  settings: ThemeSettings;
  getPages: { (): Page[] };
  getNavigation: { (): any };
}

export interface Theme {
  settings: ThemeSettings;
  getPages: { (): Page[] };
  getNavigation: { (): any };
}

export enum PageTemplate {
  README = 'Readme',
  INDEX = 'Index',
  REFLECTION = 'Reflection',
  MEMBER = 'Member',
}

export interface PageOptions {
  readme: string;
}

export interface Page {
  url: string;
  template: PageTemplate;
  model?: DeclarationReflection;
}

export interface TemplateProps {
  page: Page;
  project: ProjectReflection;
  settings: ThemeSettings;
}

export interface TemplateMapping {
  /**
   * [[DeclarationReflection.kind]] this rule applies to.
   */
  kind: ReflectionKind[];
  /**
   * Can this mapping have children or should all further reflections be rendered
   * to the defined output page?
   */
  isLeaf: boolean;
  /**
   * The name of the directory the output files should be written to.
   */
  directory:
    | 'classes'
    | 'interfaces'
    | 'enums'
    | 'modules'
    | 'variables'
    | 'types'
    | 'functions'
    | 'literals';
  /**
   * The name of the template that should be used to render the reflection.
   */
  template: PageTemplate;
}

export interface ThemeSettings {
  primaryEntryPoint: string;
  secondaryEntryPoint: string;
  anchorPattern: string;
}
