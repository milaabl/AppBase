import React, {
  useCallback,
  ChangeEvent,
  useState,
  useRef,
  FC,
  useEffect,
} from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $isCustomLinkNode } from "./CustomLinkNode";
import {
  $getSelection,
  SELECTION_CHANGE_COMMAND,
  $isRangeSelection,
  RangeSelection,
  GridSelection,
  NodeSelection,
} from "lexical";
import { TOGGLE_CUSTOM_LINK_NODE_COMMAND } from "./CustomLinkNode";
import { FloatingLinkEditorProps } from "./FloatingLinkEditor.types";
import { getSelectedNode } from "../ToolbarPlugin";
import { FormControl, InputLabel, Select, MenuItem, ListSubheader, TextField, Button } from "@mui/material";

const positionEditorElement = (editor: HTMLElement, rect: DOMRect | null) => {
  if (rect === null) {
    editor.style.opacity = "0";
    editor.style.top = "-1000px";
    editor.style.left = "-1000px";
  } else {
    editor.style.opacity = "1";
    editor.style.top = `${rect.top + rect.height + window.pageYOffset + 10}px`;
    editor.style.left = `${
      rect.left + window.pageXOffset - editor.offsetWidth / 2 + rect.width / 2 <
      0
        ? 0
        : rect.left +
          window.pageXOffset -
          editor.offsetWidth / 2 +
          rect.width / 2
    }px`;
  }
};

const LowPriority = 1;

const FloatingLinkEditor: FC<FloatingLinkEditorProps> = ({
  linkUrl,
  setLinkUrl,
  classNamesList,
  setClassNamesList,
  targetAttribute,
  setTargetAttribute,
}) => {
  const [editor] = useLexicalComposerContext();

  const editorRef = useRef(null);

  const mouseDownRef = useRef(false);

  const [lastSelection, setLastSelection] = useState<
    GridSelection | NodeSelection | RangeSelection | null
  >(null);

  const updateLinkEditor = useCallback(() => {
    console.log("update");
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);

      const parent = node.getParent();
      if ($isCustomLinkNode(parent)) {
        const _url = editor.getElementByKey(parent.__key)?.getAttribute("href");
        console.log(_url);
        if (_url) {
          setLinkUrl(_url);
        }
      } else if ($isCustomLinkNode(node)) {
        const _url = editor.getElementByKey(node.__key)?.getAttribute("href");
        if (_url) {
          console.log(_url);
          setLinkUrl(_url);
        }
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();

    if (!nativeSelection) return;

    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      !nativeSelection?.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const domRange = nativeSelection.getRangeAt(0);
      let rect;
      if (nativeSelection.anchorNode === rootElement) {
        let inner: Element | HTMLElement = rootElement;
        while (inner.firstElementChild != null) {
          inner = inner.firstElementChild;
        }
        rect = inner.getBoundingClientRect();
      } else {
        rect = domRange.getBoundingClientRect();
      }

      if (!mouseDownRef.current) {
        positionEditorElement(editorElem, rect);
      }
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== "link-input") {
      positionEditorElement(editorElem, null);
      setLastSelection(null);
    }

    return true;
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        LowPriority
      )
    );
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, []);

  const variants = ["Primary", "Secondary", "Success", "Danger", "Warning", "Info", "Light", "Dark"];
  let appearance = "link";
  if (classNamesList[0].indexOf("btn")>-1) appearance="btn";
  if (classNamesList[0].indexOf("btn-block")>-1) appearance="btn btn-block";

  console.log(appearance, classNamesList);

  const handleSave = () => {
    editor.dispatchCommand(TOGGLE_CUSTOM_LINK_NODE_COMMAND, {
      url: linkUrl,
      classNames: classNamesList,
      target: targetAttribute,
    });

    const mainEl = document.querySelector("div[contenteditable]") as HTMLDivElement;
    mainEl.click();
  }

  return (
    <div ref={editorRef} className="link-editor">
      
        <TextField label="Url" value={linkUrl} onChange={e => { setLinkUrl(e.target.value) }} fullWidth size="small" />
        
        <FormControl fullWidth>
          <InputLabel>Appearance</InputLabel>
          <Select name="classNames" fullWidth label="Appearance" size="small" value={appearance} onChange={(e) => { 
            let className = "";
            if (e.target.value.toString()!=="link") className = e.target.value.toString() + " btn-primary";
            setClassNamesList([className]) 
          }}>
            <MenuItem value="link">Standard Link</MenuItem>
            <MenuItem value="btn">Button</MenuItem>
            <MenuItem value="btn btn-block">Full Width Button</MenuItem>
          </Select>
        </FormControl>

        {appearance!=="link" &&
          <FormControl fullWidth>
            <InputLabel>Variant</InputLabel>
            <Select name="classNames" fullWidth label="Variant" size="small" value={classNamesList[0]} onChange={(e) => { setClassNamesList([e.target.value.toString()]) }}>
              {variants.map((optionValue: string) => (
                <MenuItem value={appearance + " btn-" + optionValue.toLowerCase()}>{optionValue}</MenuItem>
              ))}
            </Select>
          </FormControl>
        }

        <div className="target-check">
          <input type="checkbox" checked={targetAttribute === "_blank"} onClick={() => {
              setTargetAttribute((currentValue: string) => currentValue === "_blank" ? "_self" : "_blank" );
            }}
          />
          - Open in new window
        </div><br/>

        <Button fullWidth={true} variant="contained" onClick={handleSave}>Save</Button>

      
    </div>
  );
};

export default FloatingLinkEditor;
