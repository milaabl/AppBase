import { FC, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LinkCustomizationAttributes,
  toggleCustomLinkNode,
  TOGGLE_CUSTOM_LINK_NODE_COMMAND,
} from "./CustomLinkNode";

const COMMAND_PRIORITY = 1;

const CustomLinkNodePlugin: FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.registerCommand(
      TOGGLE_CUSTOM_LINK_NODE_COMMAND,
      (props: LinkCustomizationAttributes) => {
        toggleCustomLinkNode({
          ...props,
          getNodeByKey: (key: string) => editor.getElementByKey(key),
        });

        return true;
      },
      COMMAND_PRIORITY
    );
  }, [editor]);

  return null;
};

export default CustomLinkNodePlugin;
