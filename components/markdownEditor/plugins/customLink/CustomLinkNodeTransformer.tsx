import type { TextMatchTransformer } from "@lexical/markdown";
import { $createTextNode, LexicalNode } from "lexical";

import {
  $isCustomLinkNode,
  CustomLinkNode,
  $createCustomLinkNode,
} from "./CustomLinkNode";

export const CUSTOM_LINK_NODE_TRANSFORMER: TextMatchTransformer = {
  dependencies: [CustomLinkNode],
  export: (node: LexicalNode, _, dom) => {
    console.log(node, _, dom);
    if (!$isCustomLinkNode(node)) {
      return null;
    }

    const linkContent = `[${node.getTextContent()}](${node.__url}){:target="${node.__target}" ${node
      .__classNames
      .map((className: string) => "." + className)
      .join(" ")}}`;

    return linkContent;
  },
  importRegExp: /(?:\[([^[]+)\])(?:\(([^(]+)\))(?:({([^}]*)})?)$/,
  regExp: /(?:\[([^[]+)\])(?:\(([^(]+)\))(?:({([^}]*)})?)$/,
  replace: (textNode, match) => {
    const linkUrl = match[2],
      linkText = match[1];

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
  },
  trigger: ")",
  type: "text-match",
};
