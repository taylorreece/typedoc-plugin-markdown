import * as util from 'util';

import {
  DeclarationReflection,
  Options,
  ProjectReflection,
  Reflection,
} from 'typedoc';
import { TemplateMapping } from 'typedoc/dist/lib/output/themes/DefaultTheme';

import { Page, PageTemplate, Theme, ThemeSettings } from '../types';
import {
  buildNavigationGroups,
  createNavigationItem,
  sortNavigationGroups,
} from './navigation.utils';
import { getMappings } from './page.utils';

const URL_PREFIX = /^(http|ftp)s?:\/\//;

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

export const getPageMapping = (url: string, template: PageTemplate): Page => ({
  url,
  template,
});

export const buildUrls = (
  reflection: DeclarationReflection,
  pages: Page[],
): Page[] => {
  const anchorPattern = '%s';
  const templateMapping = getMappings(false).find((mapping) =>
    reflection.kindOf(mapping.kind),
  );

  if (templateMapping) {
    if (!reflection.url || !URL_PREFIX.test(reflection.url)) {
      const url = toUrl(templateMapping, reflection);
      pages.push(getPageMapping(url, templateMapping.template));
    }
    for (const child of reflection.children || []) {
      if (templateMapping.isLeaf) {
        applyAnchorUrl(child, reflection, anchorPattern);
      } else {
        buildUrls(child, pages);
      }
    }
  } else if (reflection.parent) {
    applyAnchorUrl(reflection, reflection.parent, anchorPattern);
  }
  console.log(pages);
  return pages;
};

export const makeTheme = (project: ProjectReflection) => {
  const pages = [];
  project.children?.forEach((child: Reflection) => {
    if (child instanceof DeclarationReflection) {
      buildUrls(child as DeclarationReflection, pages);
    }
  });

  //console.log('Array', urlArray);
};

export const createTheme = (
  project: ProjectReflection,
  typedocOptions: Options,
  themeSettings: Partial<ThemeSettings>,
): Theme => {
  const DEFAULT_THEME_SETTINGS: ThemeSettings = {
    primaryEntryPoint: 'README.md',
    secondaryEntryPoint: 'modules.md',
    anchorPattern: '%s',
  };

  const settings: ThemeSettings = {
    ...DEFAULT_THEME_SETTINGS,
    ...themeSettings,
  };

  const readme = typedocOptions.getValue('readme');
  const entryPoints = typedocOptions.getValue('entryPoints');

  return {
    settings,
    getPages() {
      const pages: Page[] = [];
      if (readme === 'none') {
        project.url = settings.primaryEntryPoint;
        pages.push(
          getPageMapping(settings.primaryEntryPoint, PageTemplate.INDEX),
        );
      } else {
        project.url = settings.secondaryEntryPoint;
        pages.push(
          getPageMapping(settings.primaryEntryPoint, PageTemplate.README),
        );
        pages.push(
          getPageMapping(settings.secondaryEntryPoint, PageTemplate.INDEX),
        );
      }
      project.children?.forEach((child: Reflection) => {
        if (child instanceof DeclarationReflection) {
          //  buildUrls(child as DeclarationReflection, pages, settings);
        }
      });
      return pages;
    },
    getNavigation() {
      const hasSeperateGlobals = readme !== 'none';
      const navigation = createNavigationItem(project.name);
      const rootName = entryPoints.length > 1 ? 'Modules' : 'Exports';
      navigation.children?.push(
        createNavigationItem(
          hasSeperateGlobals ? 'Readme' : rootName,
          settings.primaryEntryPoint,
        ),
      );
      if (hasSeperateGlobals) {
        navigation.children?.push(
          createNavigationItem(rootName, settings.secondaryEntryPoint),
        );
      }
      if (project.groups) {
        buildNavigationGroups(navigation, project.groups);
      }
      navigation.children?.sort(sortNavigationGroups);
      return navigation;
    },
  };
};
