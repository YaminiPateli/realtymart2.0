import { UrlMatcher, UrlSegment } from '@angular/router';

export function createMatcher(regex: RegExp, params: string[]): UrlMatcher {
  return (segments: UrlSegment[]) => {
    if (segments.length !== 1) return null;

    const match = segments[0].path.match(regex);
    if (!match) return null;

    const posParams: any = {};

    params.forEach((param, index) => {
      posParams[param] = new UrlSegment(match[index + 1], {});
    });

    return {
      consumed: segments,
      posParams
    };
  };
}