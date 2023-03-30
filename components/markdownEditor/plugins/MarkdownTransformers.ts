import type { ElementTransformer, Transformer } from "@lexical/markdown";
import type { LexicalNode, TextFormatType } from "lexical";

import {
  ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TRANSFORMERS
} from "@lexical/markdown";
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode
} from "@lexical/react/LexicalHorizontalRuleNode";
import { CUSTOM_LINK_NODE_TRANSFORMER } from "./customLink/CustomLinkNodeTransformer";
import { EMOJI_NODE_MARKDOWN_TRANSFORM } from "./emoji/EmojiNodeTransform";


export const HR: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node: LexicalNode) => ($isHorizontalRuleNode(node) ? "***" : null),
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _1, _2, isImport) => {
    const line = $createHorizontalRuleNode();

    // TODO: Get rid of isImport flag
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }

    line.selectNext();
  },
  type: "element"
};

export type TextFormatTransformer = Readonly<{
  format: ReadonlyArray<TextFormatType>;
  tag: string;
  intraword?: boolean;
  type: "text-format";
}>;
/*
export type TextMatchTransformer = Readonly<{
  dependencies: Array<Klass<LexicalNode>>;
  export: (
    node: LexicalNode,
    // eslint-disable-next-line no-shadow
    exportChildren: (node: ElementNode) => string,
    // eslint-disable-next-line no-shadow
    exportFormat: (node: TextNode, textContent: string) => string,
  ) => string | null;
  importRegExp: RegExp;
  regExp: RegExp;
  replace: (node: TextNode, match: RegExpMatchArray) => void;
  trigger: string;
  type: 'text-match';
}>;
*/

export const UNDERLINE: TextFormatTransformer = {
  format: ["underline"],
  intraword: false,
  tag: "_",
  type: "text-format"
};
/*
export const UNDERLINE: TextMatchTransformer = {
  dependencies: [],
  export: (node, exportChildren, exportFormat) => {
    const linkContent = `[${node.getTextContent()}](${node.getURL()})`;
    const firstChild = node.getFirstChild();
    // Add text styles only if link has single text node inside. If it's more
    // then one we ignore it as markdown does not support nested styles for links
    if (node.getChildrenSize() === 1 && $isTextNode(firstChild)) {
      return exportFormat(firstChild, linkContent);
    } else {
      return linkContent;
    }
  },
  importRegExp: /(?:\[([^[]+)\])(?:\(([^()]+)\))/,
  regExp: /(?:\[([^[]+)\])(?:\(([^()]+)\))$/,
  replace: (textNode, match) => {
    const [, linkText, linkUrl] = match;
    const linkNode = $createLinkNode(linkUrl);
    const linkTextNode = $createTextNode(linkText);
    linkTextNode.setFormat(textNode.getFormat());
    linkNode.append(linkTextNode);
    textNode.replace(linkNode);
  },
  trigger: ')',
  type: 'text-match',
};
*/

const modifiedTextTransformers = [EMOJI_NODE_MARKDOWN_TRANSFORM];

export const PLAYGROUND_TRANSFORMERS: Array<Transformer> = [
  UNDERLINE,
  ...modifiedTextTransformers,
  HR,
  ...ELEMENT_TRANSFORMERS,

  ...TRANSFORMERS.splice(0, 13),
];
