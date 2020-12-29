import { TemplateProps } from '../../../types';

/**
 * Return markdown for Readme page
 * @param project
 * @param settings
 */
export const Readme = (props: TemplateProps) => {
  const { project, settings, page } = props;

  const md: string[] = [];

  // breadcrumnbs
  //md.push(Breadcrumbs(project, settings, page.url));

  // readme content
  if (project.readme) {
    md.push(project.readme);
  }

  // return string
  return md.join('\n\n');
};
