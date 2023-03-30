import React, { useCallback, useRef, FC, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $isCustomLinkNode } from "./CustomLinkNode";
import { $getSelection, SELECTION_CHANGE_COMMAND, $isRangeSelection, $getNodeByKey } from "lexical";
import { TOGGLE_CUSTOM_LINK_NODE_COMMAND } from "./CustomLinkNode";
import { FloatingLinkEditorProps } from "./FloatingLinkEditor.types";
import { getSelectedNode } from "../ToolbarPlugin";
import { FormControl, InputLabel, Select, MenuItem, TextField, Button } from "@mui/material";

const positionEditorElement = (editor: HTMLElement, rect: DOMRect | null) => {
  if (rect === null) {
    editor.style.opacity = "0";
    editor.style.top = "-1000px";
    editor.style.left = "-1000px";
  } else {
    editor.style.opacity = "1";
    editor.style.top = `${rect.top + rect.height + window.pageYOffset + 10}px`;
    editor.style.left = `${
      rect.left + window.pageXOffset - editor.offsetWidth / 2 + rect.width / 2 < 0
        ? 0
        : rect.left
          + window.pageXOffset
          - editor.offsetWidth / 2
          + rect.width / 2
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
  selectedElementKey
}) => {
  const [editor] = useLexicalComposerContext();

  const editorRef = useRef(null);

  const mouseDownRef = useRef(false);

  /*
  const [lastSelection, setLastSelection] = useState<
    GridSelection | NodeSelection | RangeSelection | null
  >(null);
  */

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);

      const parent = node.getParent();
      if ($isCustomLinkNode(parent)) {
        const _url = editor.getElementByKey(parent.__key)?.getAttribute("href");
        if (_url) {
          setLinkUrl(_url);
        }
      } else if ($isCustomLinkNode(node)) {
        const _url = editor.getElementByKey(node.__key)?.getAttribute("href");
        if (_url) {
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
      selection !== null
      && !nativeSelection?.isCollapsed
      && rootElement !== null
      && rootElement.contains(nativeSelection.anchorNode)
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
      //setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== "link-input") {
      positionEditorElement(editorElem, null);
      //setLastSelection(null);
    }

    return true;
  }, [editor]); //eslint-disable-line

  useEffect(() => (
    mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          editor.getEditorState().read(() => {
            updateLinkEditor();
          });
          return true;
        },
        LowPriority
      )
    )
  ), [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, []); //eslint-disable-line

  const variants = ["Primary", "Secondary", "Success", "Danger", "Warning", "Info", "Light", "Dark"];
  const sizes = ["Small", "Medium", "Large"];
  let appearance = "link";
  if (classNamesList[0].indexOf("btn")>-1) appearance="btn";
  if (classNamesList[0].indexOf("btn-block")>-1) appearance="btn btn-block";

  const handleSave = () => {
    console.log("Saving!");
    editor.dispatchCommand(TOGGLE_CUSTOM_LINK_NODE_COMMAND, {
      url: linkUrl,
      classNames: classNamesList,
      target: targetAttribute
    });

    editor.update(() => {
      if (!selectedElementKey) return;

      const selectedNode = $getNodeByKey(selectedElementKey);

      selectedNode?.selectEnd();
    });
  }

  return (
    <div ref={editorRef} className="link-editor">

      <TextField label="Url" value={linkUrl} onChange={e => { setLinkUrl(e.target.value) }} fullWidth size="small" />

      <FormControl fullWidth>
        <InputLabel>Appearance</InputLabel>
        <Select name="classNames" fullWidth label="Appearance" size="small" value={appearance} onChange={(e) => {
          let className = "";
          if (e.target.value.toString()!=="link") className = e.target.value.toString();
          setClassNamesList([className, "btn-primary", "btn-medium"])
        }}>
          <MenuItem value="link">Standard Link</MenuItem>
          <MenuItem value="btn">Button</MenuItem>
          <MenuItem value="btn btn-block">Full Width Button</MenuItem>
        </Select>
      </FormControl>

      {appearance!=="link"
      && <div>
        <FormControl fullWidth>
          <InputLabel>Variant</InputLabel>
          <Select name="classNames" fullWidth label="Variant" size="small" value={ classNamesList[1] } onChange={(e) => {
            const newArray = [...classNamesList];
            let index = 0;
            newArray.forEach((item, i) => {
              variants.forEach((element) => {
                if (item.includes(element.toLowerCase())) {
                  index = i;
                };
              })
            })
            newArray.splice(index, 1, e.target.value.toString());
            setClassNamesList(newArray);
          }}>
            {variants.map((optionValue: string) => (
              <MenuItem key={appearance + " btn-" + optionValue.toLowerCase()} value={"btn-" + optionValue.toLowerCase()}>{optionValue}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Size</InputLabel>
          <Select name="classNames" fullWidth label="Size" size="small" value={ classNamesList[2] } onChange={(e) => {
            const newArray = [...classNamesList];
            let index = 0;
            newArray.forEach((item, i) => {
              sizes.forEach((element) => {
                if(item.includes(element.toLowerCase())) {
                  index = i;
                };
              })
            })
            newArray.splice(index, 1, e.target.value.toString());
            setClassNamesList(newArray);
          }}>
            {sizes.map((optionValue: string) => (
              <MenuItem key={appearance + " btn-" + optionValue.toLowerCase()} value={"btn-" + optionValue.toLowerCase()}>{optionValue}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      }

      <div className="target-check">
        <input type="checkbox" checked={targetAttribute === "_blank"} onClick={() => {
          setTargetAttribute((currentValue: string) => currentValue === "_blank" ? "_self" : "_blank" );
        }} />
        - Open in new window
      </div><br />

      <Button fullWidth={true} variant="contained" onClick={handleSave}>Save</Button>
    </div>
  );
};

export default FloatingLinkEditor;
