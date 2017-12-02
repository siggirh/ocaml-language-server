import { types } from "../../../lib";
import Session from "../session";

function isWhitespace(str: string = ""): boolean {
  return str.trim() === str;
}

export default async function(session: Session, event: types.ILocatedPosition): Promise<string> {
  const document = session.synchronizer.getTextDocument(event);
  if (!document) return "";
  const text = document.getText();
  const offset = document.offsetAt(event.position);
  let start = offset;
  while (0 < start && !isWhitespace(text[start])) start--;
  let end = offset;
  while (end < text.length && !isWhitespace(text[end])) end++;
  return text.substring(start, end);
}
