import { TemplateProps } from '../../../types';
import { escapeString } from '../helpers/escape-string.helper';
import { getRelativeUrl } from '../helpers/relative-url.helper';

/**
 * Return markdown for index/entrypoints
 * @param project
 * @param settings
 */
export const Index = (props: TemplateProps) => {
  const { project, settings, page } = props;

  const md: string[] = [];

  // breadcrumnbs
  // md.push(Breadcrumbs(project, settings, page.url));

  if (project.groups) {
    // display entry points
    md.push('# Entry points');
    project.groups.forEach((group) => {
      if (group.categories) {
        group.categories.forEach((category) => {
          md.push(`## ${category.title} ${group.title}`);
          md.push(
            category.children
              .map((child) => {
                return `* [${escapeString(child.name)}](${getRelativeUrl(
                  page.url,
                  child.url,
                )})`;
              })
              .join('\n'),
          );
        });
      } else {
        md.push(`## ${group.title}`);
        md.push(
          group.children
            .map((child) => {
              return `* [${escapeString(child.name)}](${getRelativeUrl(
                page.url,
                child.url,
              )})`;
            })
            .join('\n'),
        );
      }
    });
  }

  // return string
  return md.join('\n\n');
};
