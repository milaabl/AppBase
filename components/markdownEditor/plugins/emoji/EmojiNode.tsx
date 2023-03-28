/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  Spread,
} from 'lexical';

import {$applyNodeReplacement, TextNode} from 'lexical';

export type SerializedEmojiNode = Spread<
  {
    type: string;
  },
  SerializedTextNode
>;

export class EmojiNode extends TextNode {
  exportJSON() : SerializedEmojiNode {
    const json = {
      ...super.exportJSON(),
      type: 'emoji'
   };
   return json;
 }

static getType(): string {
  return 'emoji';
}

static clone(node: EmojiNode): EmojiNode {
  return new EmojiNode(node.__text, node.__key);
}

 static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
    const node = new EmojiNode(serializedNode.text);
    return node;
  }


  constructor(text: string, key?: NodeKey) {
    super(text, key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('span');
    const inner = super.createDOM(config);
    dom.className = 'material-symbols-outlined';
    dom.appendChild(inner);
    return dom;
  }

  updateDOM(
    prevNode: TextNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean {
    const inner = dom.firstChild;
    if (inner === null) {
      return true;
    }
    super.updateDOM(prevNode, inner as HTMLElement, config);
    return false;
  }
}

export function $isEmojiNode(
  node: LexicalNode | null | undefined,
): node is EmojiNode {
  return node instanceof EmojiNode;
}

export function $createEmojiNode(
  emojiText: string
): EmojiNode {
  const node = new EmojiNode(emojiText).setMode('token');
  return $applyNodeReplacement(node);
}


export function $toggleEmojiNode(
  emojiText: string,
): EmojiNode {
  const node = new EmojiNode(emojiText).setMode('token');
  return node;
}
