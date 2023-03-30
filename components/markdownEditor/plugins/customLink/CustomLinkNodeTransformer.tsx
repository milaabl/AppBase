import type { TextMatchTransformer } from "@lexical/markdown";
import { TextNode, $createTextNode, $isTextNode } from "lexical";

import {
  $isCustomLinkNode,
  CustomLinkNode,
  $createCustomLinkNode
} from "./CustomLinkNode";
import {
  EmojiNode,
  $createEmojiNode
} from "../emoji/EmojiNode";
import {
  EMOJI_NODE_MARKDOWN_REGEX
} from "../emoji/EmojiNodeTransform";


import iconNamesList from '../../../material/iconPicker/IconNamesList';

const CUSTOM_LINK_NODE_MARKDOWN_REGEX_QUERY = /(?:\[([^[]+?)\])(?:\(([^(]+)\))(?:({([^}]*)})?)(?:((.*)\)?))$/;

const CUSTOM_LINK_NODE_MARKDOWN_REGEX = new RegExp(CUSTOM_LINK_NODE_MARKDOWN_REGEX_QUERY);

const replaceCustomLinkNode = (textNode : TextNode, match : any) => {
  let linkUrl = match[2],
    linkText = match[1];
  if (match.input.length > match.input.trim().length) {
    linkText = ' '.repeat(match.input.length - match.input.trim().length) + linkText;
  }
  const otherText = match[5];


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

  const emojiText = otherText.replace(CUSTOM_LINK_NODE_MARKDOWN_REGEX, '').trim();





  if (match[5]) {
    const otherTextNode = $createTextNode(match[5].replace(CUSTOM_LINK_NODE_MARKDOWN_REGEX, ''));

    linkNode.getParent().append(otherTextNode);
}


  if (CUSTOM_LINK_NODE_MARKDOWN_REGEX.test(match[5])) {
    const blankNode = $createTextNode("");

    linkNode.getParent().append(blankNode);

    replaceCustomLinkNode(blankNode, match[5].match(CUSTOM_LINK_NODE_MARKDOWN_REGEX_QUERY));
  }

  if (emojiText) {
    if (!iconNamesList.includes(emojiText.replaceAll(':', ''))) return;

    linkNode.getParent().append($createEmojiNode(emojiText.replaceAll(':', '')));
  }
};

export const CUSTOM_LINK_NODE_TRANSFORMER: TextMatchTransformer = {
  dependencies: [EmojiNode, CustomLinkNode],
  export: (node, exportChildren, exportFormat) => {
    if (!$isCustomLinkNode(node)) {
      return null;
    }

      const linkContent = `[${node.getTextContent()}](${node.__url}){:target="${node.__target}" ${node
        .__classNames
        .join(' ')
        .split(' ')
        .map((className: string) => "." + className.replaceAll('.', ''))
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
  trigger: "[",
  type: "text-match"
};
