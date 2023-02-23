import {
  LexicalNode,
  createCommand,
  LexicalCommand,
  $isElementNode,
  $getSelection,
  $setSelection,
  ElementNode,
  NodeKey,
} from "lexical";
import { LinkNode } from "@lexical/link";
import utils from "@lexical/utils";

export interface LinkCustomizationAttributes {
  url: string;
  target?: string;
  classNames?: Array<string>;
}

export class CustomLinkNode extends LinkNode {
  constructor(
    url: string,
    target: string,
    classNames: Array<string>,
    key?: NodeKey
  ) {
    super(url, { target });
    this.__url = url;
    this.__target = target;
    this.__classNames = classNames;
  }

  static getType() {
    return "custom";
  }

  getKey(): string {
    return this.__key;
  }

  getTarget(): string {
    return this.__target || "_blank";
  }

  getClassNames(): Array<string> {
    return this.__classNames;
  }

  createDOM() {
    const link = document.createElement("a");

    link.href = this.__url;

    link.setAttribute("target", this.__target || "_blank");

    utils.addClassNamesToElement(link, (this.__classNames || []).join(" "));

    return link;
  }
  updateDOM() {
    return false;
  }
}

export const TOGGLE_CUSTOM_LINK_NODE_COMMAND: LexicalCommand<LinkCustomizationAttributes> =
  createCommand();

export function $createCustomLinkNode(
  url: string,
  target: string,
  classNames: Array<string>
): CustomLinkNode {
  return new CustomLinkNode(url, target, classNames);
}

export function $isCustomLinkNode(
  node: LexicalNode | null | undefined | any
): node is CustomLinkNode {
  return node instanceof LinkNode;
}

export function toggleCustomLinkNode({
  url,
  target = "_blank",
  classNames = [],
  getNodeByKey,
}: LinkCustomizationAttributes & {
  getNodeByKey: (key: NodeKey) => HTMLElement | null;
}): void {
  const selection = $getSelection();

  if (selection !== null) {
    $setSelection(selection);
  }

  const sel = $getSelection();

  const addAttributesToLinkNode = (linkNode: CustomLinkNode) => {
    const dom = getNodeByKey(linkNode.getKey());

    if (!dom) return;

    dom.setAttribute("href", url);
    dom.setAttribute("target", target);

    utils.addClassNamesToElement(dom, classNames.join(" "));
  };

  if (sel !== null) {
    const nodes = sel.extract();

    if (url === null) {
      nodes.forEach((node) => {
        const parent = node.getParent();

        if ($isCustomLinkNode(parent)) {
          const children = parent.getChildren();

          for (let i = 0; i < children.length; i++) {
            parent.insertBefore(children[i]);
          }

          addAttributesToLinkNode(parent);

          parent.remove();
        }
      });
    } else {
      if (nodes.length === 1) {
        const firstNode = nodes[0];

        if ($isCustomLinkNode(firstNode)) {
          firstNode.setURL(url);
          return;
        } else {
          const parent = firstNode.getParent();

          if ($isCustomLinkNode(parent)) {
            addAttributesToLinkNode(parent);
            return;
          }
        }
      }

      let prevParent: ElementNode | null = null;
      let linkNode: CustomLinkNode | null = null;

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
          addAttributesToLinkNode(linkNode);
          return;
        }

        if (!parent.is(prevParent)) {
          prevParent = parent;
          linkNode = $createCustomLinkNode(url, target, classNames);

          if (!linkNode) return;

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

        if (!linkNode) return;

        addAttributesToLinkNode(linkNode);

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
}
