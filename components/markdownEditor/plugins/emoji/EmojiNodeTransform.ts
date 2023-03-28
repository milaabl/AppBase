import { EmojiNode, $isEmojiNode, $createEmojiNode, $toggleEmojiNode } from './EmojiNode';
import  { materialIcons } from './emoji-list';

import type { TextMatchTransformer } from "@lexical/markdown";
import { TextNode, $createTextNode, $isTextNode } from "lexical";

const EMOJI_NODE_MARKDOWN_REGEX_QUERY = /:[A-Za-z_]+:$/;

export const EMOJI_NODE_MARKDOWN_REGEX = new RegExp(EMOJI_NODE_MARKDOWN_REGEX_QUERY);

const replaceEmojiMarkdownWithNode = (textNode: TextNode, match) => {
  console.log(textNode.__text);
  const emojiNode = $createEmojiNode(
    textNode.__text.replaceAll(':', '')
  );

  textNode.replace(emojiNode);

  return emojiNode;
};

export const EMOJI_NODE_MARKDOWN_TRANSFORM: TextMatchTransformer = {
  dependencies: [EmojiNode],
  export: (node, exportChildren, exportFormat) => {
    if (!($isEmojiNode(node) || $isTextNode(node))) {
      return null;
    }

    if (!materialIcons.includes(node.getTextContent().replaceAll(':', ''))) {
      return null;
    }

    const linkContent = ':' + node.__text.replaceAll(':', '') + ':';

    return linkContent;
  },
  importRegExp: EMOJI_NODE_MARKDOWN_REGEX,
  regExp: EMOJI_NODE_MARKDOWN_REGEX,
  replace: replaceEmojiMarkdownWithNode,
  trigger: ":",
  type: "text-match"
};
