import * as path from 'path';

export const getRelativeUrl = (location: string, absolute?: string): string => {
  const urlPrefix = /^(http|ftp)s?:\/\//;

  if (!absolute) {
    return '';
  }

  if (urlPrefix.test(absolute)) {
    return absolute;
  } else {
    const relative = path.relative(
      path.dirname(location),
      path.dirname(absolute),
    );
    return path.join(relative, path.basename(absolute)).replace(/\\/g, '/');
  }
};
