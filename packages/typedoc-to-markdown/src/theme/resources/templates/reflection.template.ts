import { TemplateProps } from '../../../types';
import { Breadcrumbs } from '../partials/breadrcumbs.partial';
import { Comments } from '../partials/comments.partial';
import { ParameterTable } from '../partials/parameter-table.partial';
import { ReflectionTitle } from '../partials/reflection-title.partial';

/**
 * Return markdown for a reflection
 * @param page
 * @param project
 */
export const Reflection = (props: TemplateProps) => {
  const { project, page } = props;

  const md: string[] = [];

  if (!page.model) {
    return '';
  }

  // breadcrumnbs
  md.push(Breadcrumbs(props));

  // title
  md.push(`# ${ReflectionTitle(page, project, true)}`);

  // comments
  if (page.model.hasComment() && page.model.comment) {
    md.push(Comments(page.model.comment));
  }

  // type paramters
  if (page.model.typeParameters) {
    md.push(
      `## Type parameters
      ${ParameterTable(page.model.typeParameters, 'typeParameters')}
      `,
    );
  }

  // return string
  return md.join('\n\n');
};
