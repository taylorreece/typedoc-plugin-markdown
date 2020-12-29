import { Comment as TypedocComment } from 'typedoc/dist/lib/models';

export function Comments(comment: TypedocComment) {
  const md: string[] = [];

  if (comment.shortText) {
    md.push(parseComments(comment.shortText));
  }
  if (comment.text) {
    md.push(parseComments(comment.text));
  }
  if (comment.tags) {
    const tags = comment.tags.map(
      (tag) =>
        `**\`${tag.tagName}\`** ${tag.text ? parseComments(tag.text) : ''}`,
    );
    md.push(tags.join('\n\n'));
  }
  return md.join('\n\n');
}

export const parseComments = (text: string) => {
  return text;
};
