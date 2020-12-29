import { DeclarationReflection } from 'typedoc';

import { TemplateProps } from '../../../types';
import { getRelativeUrl } from '../helpers/relative-url.helper';

export const Breadcrumbs = (props: TemplateProps) => {
  const md: string[] = [];
  const globalsName = 'Modules';
  const { project, page, settings } = props;
  md.push(
    page.url === settings.primaryEntryPoint
      ? project.name
      : `[${project.name}](${getRelativeUrl(
          page.url,
          settings.primaryEntryPoint,
        )})`,
  );
  if (project.readme !== 'none') {
    md.push(
      page.url === project.url
        ? globalsName
        : `[${globalsName}](${getRelativeUrl(
            page.url,
            settings.secondaryEntryPoint,
          )})`,
    );
  }
  if (page.model) {
    breadcrumb(page.url, page.model, md);
  }
  return md.join(' / ');
};

const breadcrumb = (
  url: string,
  model: DeclarationReflection,
  md: string[],
) => {
  if (model && model.parent) {
    breadcrumb(url, model.parent as DeclarationReflection, md);
    if (model.url) {
      md.push(
        url === model.url
          ? `${escape(model.name)}`
          : `[${escape(model.name)}](${getRelativeUrl(url, model.url)})`,
      );
    }
  }
  return md;
};
