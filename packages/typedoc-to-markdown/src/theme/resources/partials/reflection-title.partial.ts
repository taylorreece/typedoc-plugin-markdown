import { ProjectReflection } from 'typedoc';

import { Page } from '../../../types';

export const ReflectionTitle = (
  page: Page,
  project: ProjectReflection,
  shouldEscape = true,
) => {
  const title: string[] = [];
  if (!page.model) {
    return '';
  }
  if (page.model.kindString && page.url !== project.url) {
    title.push(`${page.model.kindString}: `);
  }
  title.push(shouldEscape ? escape(page.model.name) : page.model.name);
  if (page.model.typeParameters) {
    const typeParameters = page.model.typeParameters
      .map((typeParameter) => typeParameter.name)
      .join(', ');
    title.push(`<${typeParameters}${shouldEscape ? '\\>' : '>'}`);
  }
  return title.join('');
};
