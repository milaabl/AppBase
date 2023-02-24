import type { TextMatchTransformer } from "@lexical/markdown";
import { $createTextNode, LexicalNode, $isTextNode } from "lexical";

import {
  $isCustomLinkNode,
  CustomLinkNode,
  $createCustomLinkNode,
} from "./CustomLinkNode";

const CUSTOM_LINK_NODE_MARKDOWN_REGEX_QUERY = /(?:\[([^[]+)\])(?:\(([^(]+)\))(?:({([^}]*)})?)(?:(.*))$/;

const CUSTOM_LINK_NODE_MARKDOWN_REGEX = new RegExp(CUSTOM_LINK_NODE_MARKDOWN_REGEX_QUERY);

const replaceCustomLinkNode = (textNode, match) => {
  const linkUrl = match[2],
    linkText = match[1];

    const otherText = match[5];
    console.log(otherText);

  const linkNode = $createCustomLinkNode(
    linkUrl,
    match[4] ? (match[4].includes("_self") ? "_self" : "_blank") : "_blank",
    match[4]
      ? match[4]
          .split(" ")
          .filter((word: string) => word[0] === ".")
          .map((word: string) => word.replace(".", ""))
      : []
  );

  const linkTextNode = $createTextNode(linkText);
  linkTextNode.setFormat(textNode.getFormat());

  linkNode.append(linkTextNode);
  textNode.replace(linkNode);

  if (otherText) {
    if (CUSTOM_LINK_NODE_MARKDOWN_REGEX.test(otherText)) {
      console.log(otherText);

      const blankNode = $createTextNode('');

      linkNode.getParent().append(blankNode);

      replaceCustomLinkNode(blankNode, otherText.match(CUSTOM_LINK_NODE_MARKDOWN_REGEX_QUERY));

      return;
    }
    const otherTextNode = $createTextNode(otherText);

    linkNode.getParent().append(otherTextNode);
  }
};

export const CUSTOM_LINK_NODE_TRANSFORMER: TextMatchTransformer = {
  dependencies: [CustomLinkNode],
  export: (node, exportChildren, exportFormat) => {
    if (!$isCustomLinkNode(node)) {
      return null;
    }
    const linkContent = `[${node.getTextContent()}](${node.__url}){:target="${node.__target}" ${node
      .__classNames
      .map((className: string) => "." + className)
      .join(" ")}}`;

    const firstChild = node.getFirstChild();

    if (node.getChildrenSize() === 1 && $isTextNode(firstChild)) {
      return exportFormat(firstChild, linkContent);
    } else {
      return linkContent;
    }
  },
  importRegExp: CUSTOM_LINK_NODE_MARKDOWN_REGEX,
  regExp: CUSTOM_LINK_NODE_MARKDOWN_REGEX,
  replace: replaceCustomLinkNode,
  trigger: '}',
  type: 'text-match',
};
