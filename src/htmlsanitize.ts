import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeValue } from '@angular/platform-browser';
import { Marked } from 'marked';

@Pipe({ name: 'parseToHtml', standalone: true })
export class ParseMDPipe implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) {}

  transform(markdownContent: string): SafeValue {
    // parse the content to raw HTML
    const markedParser = new Marked();
    const rawHtml = markedParser.parse(markdownContent);

    // sanitize the raw HTML for safety
    const sanitizedResult =  this._sanitizer.sanitize(SecurityContext.HTML, rawHtml);
    return (sanitizedResult) ? sanitizedResult : "";
  }
}

@Pipe({ name: 'parseExistingHtml', standalone: true })
export class ParseHtmlPipe implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) {}

  transform(rawHtml: string): SafeValue {
    // sanitize the existing HTML for safety
    const sanitizedResult =  this._sanitizer.sanitize(SecurityContext.HTML, rawHtml);
    return (sanitizedResult) ? sanitizedResult : "";
  }
}
