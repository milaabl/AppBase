import React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
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

interface Props {
  value: string;
  onChange?: (value: string) => void;
  mode?: "interactive" | "preview";
  style?: any
  textAlign?: "left" | "center" | "right"
}

export function Editor({ value, onChange = () => { }, mode = "interactive", textAlign = "left", style }: Props) {
  const [fullScreen, setFullScreen] = React.useState(false);

  const handleChange = (editorState: any) => {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(PLAYGROUND_TRANSFORMERS);
      onChange(markdown)
    });
  };

  const onError = (error: any) => {
    console.error(error);
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
      CustomLinkNode,
      LinkNode
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

  const handleCloseFullScreen = (newValue: string) => {
    onChange(newValue)
    setFullScreen(false);
  }

  const getFullScreenModal = () => {
    if (fullScreen) return (<MarkdownModal value={value} hideModal={handleCloseFullScreen} />);
  }

  return (
    <>
      <LexicalComposer initialConfig={initialConfig}>
        <div className={(mode === "preview") ? `editor-container preview ${textAlignClass}` : `editor-container ${textAlignClass}`} style={Object.assign({ border: mode === "preview" ? "none" : "1px solid lightgray" }, style)}>
          {mode !== "preview" && <ToolbarPlugin goFullScreen={() => { setFullScreen(true) }} />}
          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" style={{ minHeight: mode === "preview" ? "auto" : "150px" }} />}
              placeholder={mode !== "preview" ? <div className="editor-placeholder">Enter some text...</div> : null}
              ErrorBoundary={LexicalErrorBoundary}

            />
            <CustomLinkNodePlugin />
            <OnChangePlugin onChange={handleChange} />
            {mode !== "preview" && <AutoFocusPlugin />}
            <HistoryPlugin />
            <ListPlugin />
            <CustomAutoLinkPlugin />
            
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <ReadOnlyPlugin isDisabled={mode === "preview"} />
            <ControlledEditorPlugin value={value} isPreview={mode === "preview"} />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          </div>
        </div>
      </LexicalComposer>
      {getFullScreenModal()}
    </>
  );
}
