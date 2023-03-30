/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  TypeaheadOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  TextNode,
} from 'lexical';
import { $createEmojiNode } from './EmojiNode';
import materialIcons from '../../../material/iconPicker/IconNamesList';
import * as React from 'react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import * as ReactDOM from 'react-dom';


function EmojiMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: string;
}) {
  let className = 'item';
  if (isSelected) {
    className += ' selected';
  }
  return (
    <li
      key={option}
      tabIndex={-1}
      className={className}
      role="option"
      aria-selected={isSelected}
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}>
      <span className="text">
        <span className="material-symbols-outlined">{option}</span> {option}
      </span>
    </li>
  );
}


const MAX_EMOJI_SUGGESTION_COUNT = 10;

export default function EmojiPickerPlugin() {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);



  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch(':', {
    minLength: 0,
  });

  const options: Array<any> = useMemo(() => {
    let result = materialIcons.filter((option: string) =>
      (queryString != null) ? new RegExp(queryString, 'gi').exec(option) : materialIcons
    );
    return result.slice(0, MAX_EMOJI_SUGGESTION_COUNT);
  }, [queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: any,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection) || selectedOption == null) {
          return;
        }

        if (nodeToRemove) {
          nodeToRemove.remove();
        }

        selection.insertNodes([$createEmojiNode(selectedOption)]);

        closeMenu();
      });
    },
    [editor],
  );

  if (typeof document === "undefined") {
    return null;
  }

  return (
    <LexicalTypeaheadMenuPlugin
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        {selectedIndex, selectOptionAndCleanUp, setHighlightedIndex},
      ) => {
        if (anchorElementRef.current == null || options.length === 0) {
          return null;
        }

        return anchorElementRef.current && options.length
          ? ReactDOM.createPortal(
            <div className="typeahead-popover emoji-menu">
              <ul>
                {options.map((option: string, index) => (
                  <div key={option}>
                    <EmojiMenuItem
                      index={index}
                      isSelected={selectedIndex === index}
                      onClick={() => {
                        setHighlightedIndex(index);
                        selectOptionAndCleanUp(option);
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(index);
                      }}
                      option={option}
                    />
                  </div>
                ))}
              </ul>
            </div>,
            anchorElementRef.current,
          )
          : null;
      }}
    />
  );
}
