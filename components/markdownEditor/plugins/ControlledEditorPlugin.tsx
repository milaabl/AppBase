import { useState, useEffect } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $convertFromMarkdownString } from "@lexical/markdown";
import { PLAYGROUND_TRANSFORMERS } from "./MarkdownTransformers";

interface Props {
  value: string
  isPreview?: boolean;
}

export function ControlledEditorPlugin({ value, isPreview = false }: Props): any {
  const [editor] = useLexicalComposerContext();
  const [hasInit, setHasInit] = useState<boolean>(false);

  useEffect(() => {
    setHasInit(true);
    editor.update(() => {
      $convertFromMarkdownString(value, PLAYGROUND_TRANSFORMERS);
    });
  }, [value]) //eslint-disable-line

  return null;
}
