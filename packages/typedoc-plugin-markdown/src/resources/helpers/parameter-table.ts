import { ParameterReflection, ReflectionKind } from 'typedoc';

import { comment } from './comment';
import { escape } from './escape';
import { stripLineBreaks } from './strip-line-breaks';
import { type } from './type';

export function parameterTable(this: ParameterReflection[]) {
  const flattenParams = (current: any) => {
    return current.type?.declaration?.children?.reduce(
      (acc: any, child: any) => {
        const childObj = {
          ...child,
          name: `${current.name}.${child.name}`,
        };
        return parseParams(childObj, acc);
      },
      [],
    );
  };

  const parseParams = (current: any, acc: any) => {
    const shouldFlatten =
      current.type?.declaration?.kind === ReflectionKind.TypeLiteral &&
      current.type?.declaration?.children;
    return shouldFlatten
      ? [...acc, current, ...flattenParams(current)]
      : [...acc, current];
  };

  return table(
    this.reduce((acc: any, current: any) => parseParams(current, acc), []),
  );
}

function table(parameters: any) {
  const showDefaults = hasDefaultValues(parameters);

  const comments = parameters.map(
    (param) =>
      !!param.comment?.text?.trim() || !!param.comment?.shortText?.trim(),
  );
  const hasComments = !comments.every((value) => !value);

  const headers = ['Name', 'Type'];

  if (showDefaults) {
    headers.push('Default value');
  }

  if (hasComments) {
    headers.push('Description');
  }

  const rows = parameters.map((parameter) => {
    const row: string[] = [];

    row.push(
      `\`${parameter.flags.isRest ? '...' : ''}${parameter.name}${
        parameter.flags.isOptional ? '?' : ''
      }\``,
    );

    row.push(type.call(parameter.type, 'object'));

    if (showDefaults) {
      row.push(getDefaultValue(parameter));
    }
    if (hasComments) {
      if (parameter.comment) {
        row.push(
          stripLineBreaks(comment.call(parameter.comment)).replace(
            /\|/g,
            '\\|',
          ),
        );
      } else {
        row.push('-');
      }
    }
    return `| ${row.join(' | ')} |\n`;
  });

  const output = `\n| ${headers.join(' | ')} |\n| ${headers
    .map(() => ':------')
    .join(' | ')} |\n${rows.join('')}`;
  return output;
}

function getDefaultValue(parameter: ParameterReflection) {
  return parameter.defaultValue && parameter.defaultValue !== '...'
    ? escape(parameter.defaultValue)
    : '`undefined`';
}

function hasDefaultValues(parameters: ParameterReflection[]) {
  const defaultValues = (parameters as ParameterReflection[]).map(
    (param) =>
      param.defaultValue !== '{}' &&
      param.defaultValue !== '...' &&
      !!param.defaultValue,
  );

  return !defaultValues.every((value) => !value);
}
