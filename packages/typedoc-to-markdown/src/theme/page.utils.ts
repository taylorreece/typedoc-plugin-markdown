import * as util from 'util';

import {
  DeclarationReflection,
  ProjectReflection,
  Reflection,
  ReflectionKind,
} from 'typedoc';

import { Page, PageTemplate, TemplateMapping, ThemeSettings } from '../types';

const URL_PREFIX = /^(http|ftp)s?:\/\//;

export const buildUrls = (
  reflection: DeclarationReflection,
  pages: Page[],
  settings: ThemeSettings,
): Page[] => {
  const anchorPattern = settings.anchorPattern;
  const templateMapping = getMappings(false).find((mapping) =>
    reflection.kindOf(mapping.kind),
  );

  if (templateMapping) {
    if (!reflection.url || !URL_PREFIX.test(reflection.url)) {
      const url = toUrl(templateMapping, reflection);
      pages.push(getPageMapping(url, templateMapping.template, reflection));
      reflection.url = url;
      reflection.hasOwnDocument = true;
    }
    for (const child of reflection.children || []) {
      if (templateMapping.isLeaf) {
        applyAnchorUrl(child, reflection, anchorPattern);
      } else {
        buildUrls(child, pages, settings);
      }
    }
  } else if (reflection.parent) {
    applyAnchorUrl(reflection, reflection.parent, anchorPattern);
  }
  return pages;
};

function toUrl(
  templateMapping: TemplateMapping,
  reflection: DeclarationReflection,
) {
  return templateMapping.directory + '/' + getUrl(reflection) + '.md';
}

function getUrl(
  reflection: Reflection,
  relative?: Reflection,
  separator = '.',
): string {
  let url = reflection.getAlias();
  if (
    reflection.parent &&
    reflection.parent !== relative &&
    !(reflection.parent instanceof ProjectReflection)
  ) {
    url = getUrl(reflection.parent, relative, separator) + separator + url;
  }
  return url;
}

function applyAnchorUrl(
  reflection: Reflection,
  container: Reflection,
  anchorPattern: string,
) {
  if (!reflection.url || !URL_PREFIX.test(reflection.url)) {
    const reflectionId = reflection.name.toLowerCase();
    const anchor = util.format(anchorPattern, reflectionId);
    reflection.url = container.url + '#' + anchor;
    reflection.anchor = anchor;
    reflection.hasOwnDocument = false;
  }
  reflection.traverse((child) => {
    if (child instanceof DeclarationReflection) {
      applyAnchorUrl(child, container, anchorPattern);
    }
  });
}

export const getMappings = (
  allReflectionsHaveOwnDocument: boolean,
): TemplateMapping[] => [
  {
    kind: [ReflectionKind.Class],
    isLeaf: false,
    directory: 'classes',
    template: PageTemplate.REFLECTION,
  },
  {
    kind: [ReflectionKind.Interface],
    isLeaf: false,
    directory: 'interfaces',
    template: PageTemplate.REFLECTION,
  },
  {
    kind: [ReflectionKind.Enum],
    isLeaf: false,
    directory: 'enums',
    template: PageTemplate.REFLECTION,
  },
  {
    kind: [ReflectionKind.Namespace, ReflectionKind.Module],
    isLeaf: false,
    directory: 'modules',
    template: PageTemplate.REFLECTION,
  },
  ...(allReflectionsHaveOwnDocument
    ? ([
        {
          kind: [ReflectionKind.Variable],
          isLeaf: true,
          directory: 'variables',
          template: PageTemplate.MEMBER,
        },
        {
          kind: [ReflectionKind.TypeAlias],
          isLeaf: true,
          directory: 'types',
          template: PageTemplate.MEMBER,
        },
        {
          kind: [ReflectionKind.Function],
          isLeaf: true,
          directory: 'functions',
          template: PageTemplate.MEMBER,
        },
        {
          kind: [ReflectionKind.ObjectLiteral],
          isLeaf: true,
          directory: 'literals',
          template: PageTemplate.MEMBER,
        },
      ] as TemplateMapping[])
    : []),
];

export const getPageMapping = (
  url: string,
  template: PageTemplate,
  model?: DeclarationReflection,
): Page => ({ url, template, model });

export const createPage = (
  url: string,
  template: PageTemplate,
  model?: DeclarationReflection,
): Page => ({ url, template, model });
