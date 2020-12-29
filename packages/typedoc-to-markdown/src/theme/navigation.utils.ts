import { NavigationItem } from 'typedoc';
import { ContainerReflection, ReflectionGroup } from 'typedoc/dist/lib/models';

export const buildNavigationGroups = (
  navigation: NavigationItem,
  groups: ReflectionGroup[],
) => {
  groups
    .filter((group) => group.allChildrenHaveOwnDocument())
    .forEach((reflectionGroup) => {
      let reflectionGroupItem = navigation.children?.find(
        (child) => child.title === reflectionGroup.title,
      );
      if (!reflectionGroupItem) {
        reflectionGroupItem = createNavigationItem(reflectionGroup.title);
        navigation.children?.push(reflectionGroupItem);
      }
      reflectionGroup.children.forEach((reflectionGroupChild) => {
        const reflectionGroupChildItem = createNavigationItem(
          reflectionGroupChild.getFullName(),
          reflectionGroupChild.url,
        );
        if (reflectionGroupItem) {
          reflectionGroupItem.children?.push(reflectionGroupChildItem);
        }
        const reflection = reflectionGroupChild as ContainerReflection;
        if (reflection.groups) {
          buildNavigationGroups(navigation, reflection.groups);
        }
      });
    });
};

export const createNavigationItem = (title: string, url?: string) => {
  const navigationItem = new NavigationItem(title.replace(/\"/g, ''), url);
  navigationItem.isLabel = !url;
  navigationItem.children = [];
  delete navigationItem.reflection;
  delete navigationItem.parent;
  return navigationItem;
};

export const sortNavigationGroups = (a: NavigationItem, b: NavigationItem) => {
  const weights = {
    ['Namespaces']: 1,
    ['Enumerations']: 2,
    ['Classes']: 3,
    ['Interfaces']: 4,
    ['Type aliases']: 5,
    ['Variables']: 6,
    ['Functions']: 7,
    ['Object literals']: 8,
  };
  const aWeight = weights[a.title] || 0;
  const bWeight = weights[b.title] || 0;
  return aWeight - bWeight;
};
