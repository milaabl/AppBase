import { useState, useEffect } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $convertFromMarkdownString } from "@lexical/markdown";
import { PLAYGROUND_TRANSFORMERS } from "./MarkdownTransformers";

interface Props {
  value: string
  isPreview?: boolean;
  isFullscreen?: boolean;
}

export function ControlledEditorPlugin({ isFullscreen, value, isPreview = false }: Props): any {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (isFullscreen || isPreview) {
      editor.update(() => {
        $convertFromMarkdownString(value, PLAYGROUND_TRANSFORMERS);
      });
    }
  }, [value]) //eslint-disable-line

  return null;
}
