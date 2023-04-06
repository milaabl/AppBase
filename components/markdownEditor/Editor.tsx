import React, {useCallback, useMemo} from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalNode } from "lexical";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS, $convertToMarkdownString, $convertFromMarkdownString } from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { theme } from "./theme";
import { ToolbarPlugin, CustomAutoLinkPlugin, ListMaxIndentLevelPlugin, PLAYGROUND_TRANSFORMERS, ReadOnlyPlugin, ControlledEditorPlugin } from "./plugins";
import { MarkdownModal } from "./MarkdownModal";
import CustomLinkNodePlugin from "./plugins/customLink/CustomLinkNodePlugin";
import { CustomLinkNode } from "./plugins/customLink/CustomLinkNode";
import EmojisPlugin from "./plugins/emoji/EmojisPlugin";
import { EmojiNode } from "./plugins/emoji/EmojiNode";
import EmojiPickerPlugin from "./plugins/emoji/EmojiPickerPlugin";

interface Props {
  value: string;
  onChange?: (value: string) => void;
  mode?: "interactive" | "preview";
  style?: any;
  textAlign?: "left" | "center" | "right";
  placeholder?: string;
}

export function Editor({ value, onChange = () => { }, mode = "interactive", textAlign = "left", style, placeholder = "Enter some text..." }: Props) {
  const [fullScreen, setFullScreen] = React.useState(false);

  const handleChange = (editorState: any) => {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(PLAYGROUND_TRANSFORMERS);
      onChange(markdown);
    });
  };

  const onError = (error: any) => {
    console.error(error);
  };

  const handleModalOnChange = (value : string) => {
    onChange(value);
  };

  const handleCloseFullScreen = (newValue: string) => {
    setFullScreen(false);
  };

  const initialConfig = {
    editorState: () => $convertFromMarkdownString(value, PLAYGROUND_TRANSFORMERS),
    namespace: "editor",
    theme,
    onError,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
      CustomLinkNode,
      EmojiNode,
      {
        replace: LinkNode,
        with: (node: LexicalNode) => (
          new CustomLinkNode(node.__url, node.__target, [])
        )
      }
    ]
  };

  let textAlignClass = ""
  switch (textAlign) {
    case "center":
      textAlignClass = "text-center"
      break;
    case "right":
      textAlignClass = "text-right"
      break;
    case "left":
    default:
      textAlignClass = "text-left"
      break;
  }

  return (
    <>
      <LexicalComposer initialConfig={initialConfig}>
        <div className={(mode === "preview") ? `editor-container preview ${textAlignClass}` : `editor-container ${textAlignClass}`} style={Object.assign({ border: mode === "preview" ? "none" : "1px solid lightgray" }, style)}>
          {mode !== "preview" && <ToolbarPlugin goFullScreen={() => { setFullScreen(true) }} />}
          <div className="editor-inner">
            {!fullScreen && <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" style={{ minHeight: mode === "preview" ? "auto" : "150px" }} />}
              placeholder={mode !== "preview" ? <div className="editor-placeholder">{placeholder}</div> : null}
              ErrorBoundary={LexicalErrorBoundary}
            /> }
            <CustomLinkNodePlugin />
            {mode !== "preview" && <EmojiPickerPlugin />}
            <EmojisPlugin />
            <OnChangePlugin onChange={handleChange} />
            {mode !== "preview" && <AutoFocusPlugin />}
            <HistoryPlugin />
            <ListPlugin />
            <CustomAutoLinkPlugin />

            <ListMaxIndentLevelPlugin maxDepth={7} />
            <ReadOnlyPlugin isDisabled={mode === "preview"} />
            <ControlledEditorPlugin isFullscreen={fullScreen} value={value} isPreview={mode === "preview"} />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          </div>
        </div>
      </LexicalComposer>
      {fullScreen && <MarkdownModal onChange={handleModalOnChange} value={value} hideModal={handleCloseFullScreen} />}
    </>
  );
}
