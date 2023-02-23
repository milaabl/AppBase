import {
  LexicalNode,
  createCommand,
  LexicalCommand,
  $isElementNode,
  $getSelection,
  EditorConfig,
  $setSelection,
  ElementNode,
  NodeKey,
  $applyNodeReplacement,
  $isRangeSelection
} from "lexical";
import { LinkNode } from "@lexical/link";
import utils from "@lexical/utils";

export interface LinkCustomizationAttributes {
  url: string;
  target?: string;
  classNames?: Array<string>;
}

export class CustomLinkNode extends LinkNode {
  __url: string;
  __target: string;
  __classNames: Array<string>;
  constructor(
    url: string,
    target: string,
    classNames: Array<string>,
    key?: NodeKey
  ) {
    super(url, { target }, key);
    this.__url = url || 'https://';
    this.__target = target || '_self';
    this.__classNames = classNames || [];
  }

  static getType() : string {
    return 'customlinknode';
  }

  static clone(node : CustomLinkNode) : CustomLinkNode {
    const newLinkNode = new CustomLinkNode(node.__url, node.__target, node.__classNames, node.__key);

    return $applyNodeReplacement(newLinkNode);
  }

  createDOM() {
    const link = document.createElement("a");

    link.href = this.__url;

    link.setAttribute("target", this.__target || "_blank");

    utils.addClassNamesToElement(link, (this.__classNames || []).join(" "));

    return link;
  }

  updateDOM(): boolean {
    return false;
  }

  setClassNames(classNames : Array<string>) : void {
    const writable = this.getWritable();

    writable.__classNames = classNames;
  }
}

export const TOGGLE_CUSTOM_LINK_NODE_COMMAND: LexicalCommand<LinkCustomizationAttributes> =
  createCommand();

export function $createCustomLinkNode(
  url: string,
  target: string,
  classNames: Array<string>
): CustomLinkNode {
  return $applyNodeReplacement(new CustomLinkNode(url, target, classNames));
}

export function $isCustomLinkNode(
  node: LexicalNode | null | undefined | any
): node is CustomLinkNode {
  return node instanceof LinkNode;
}

export const toggleCustomLinkNode = (
  {
    url,
    target = "_blank",
    classNames = [],
    getNodeByKey,
  } : LinkCustomizationAttributes & {
    getNodeByKey: (key: NodeKey) => HTMLElement | null;
  }): void => {
    const addAttributesToLinkNode = (linkNode: CustomLinkNode, { url, target, classNames}: LinkCustomizationAttributes) => {
      const dom = getNodeByKey(linkNode.getKey());

      if (!dom) return;

      const uniqueClassNames = classNames[0].split(' ');

      linkNode.setURL(url);
      linkNode.setTarget(target);

      linkNode.setClassNames(uniqueClassNames);

      dom.setAttribute("href", url);
      dom.setAttribute("target", target);

      dom.setAttribute('class', uniqueClassNames.join(' '));
    };

  const selection = $getSelection();

  if (!$isRangeSelection(selection)) {
    return;
  }

  const nodes = selection.extract();

  if (url === null) {
    // Remove LinkNodes
    nodes.forEach((node) => {
      const parent = node.getParent();

      if ($isCustomLinkNode(parent)) {
        const children = parent.getChildren();

        for (let i = 0; i < children.length; i++) {
          parent.insertBefore(children[i]);
        }

        parent.remove();
      }
    });
  } else {
    // Add or merge LinkNodes
    if (nodes.length === 1) {
      const firstNode = nodes[0];
      // if the first node is a LinkNode or if its
      // parent is a LinkNode, we update the URL, target and rel.
      const linkNode = $isCustomLinkNode(firstNode)
        ? firstNode
        : $getLinkAncestor(firstNode);
      if (linkNode !== null && $isCustomLinkNode(linkNode)) {
        addAttributesToLinkNode(linkNode, {url, target, classNames});
        return;
      }
    }

    let prevParent: ElementNode | LinkNode | null = null;
    let linkNode: LinkNode | null = null;

    nodes.forEach((node) => {
      const parent = node.getParent();

      if (
        parent === linkNode ||
        parent === null ||
        ($isElementNode(node) && !node.isInline())
      ) {
        return;
      }

      if ($isCustomLinkNode(parent)) {
        linkNode = parent;

        addAttributesToLinkNode(parent, {url, target, classNames});

        return;
      }

      if (!parent.is(prevParent)) {
        prevParent = parent;
        linkNode = $createCustomLinkNode(url, target, classNames);

        if ($isCustomLinkNode(parent)) {
          if (node.getPreviousSibling() === null) {
            parent.insertBefore(linkNode);
          } else {
            parent.insertAfter(linkNode);
          }
        } else {
          node.insertBefore(linkNode);
        }
      }

      if ($isCustomLinkNode(node)) {
        if (node.is(linkNode)) {
          return;
        }
        if (linkNode !== null) {
          const children = node.getChildren();

          for (let i = 0; i < children.length; i++) {
            linkNode.append(children[i]);
          }
        }

        node.remove();
        return;
      }

      if (linkNode !== null) {
        linkNode.append(node);
      }
    });
  }
}

const $getLinkAncestor = (node: LexicalNode): null | LexicalNode => {
  return $getAncestor(node, (ancestor) => $isCustomLinkNode(ancestor));
}

const $getAncestor = (
  node: LexicalNode,
  predicate: (ancestor: LexicalNode) => boolean,
): null | LexicalNode => {
  let parent: null | LexicalNode = node;
  while (
    parent !== null &&
    (parent = parent.getParent()) !== null &&
    !predicate(parent)
  );
  return parent;
}
