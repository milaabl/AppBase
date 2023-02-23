import { Dispatch, SetStateAction } from "react";

export interface FloatingLinkEditorProps {
  linkUrl: string;
  setLinkUrl: (value: string) => void;
  targetAttribute: string;
  setTargetAttribute: Dispatch<SetStateAction<string>>;
  classNamesList: Array<string>;
  setClassNamesList: (value: Array<string>) => void;
  selectedElementKey: string | null;
}
