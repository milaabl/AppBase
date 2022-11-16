import { SmallButton } from "@/appBase/components";
import { ElementInterface, SectionInterface } from "@/helpers";
import { DroppableArea } from "./admin/DroppableArea";
import { RowElement } from "./elementTypes/RowElement";
import { TextOnly } from "./elementTypes/TextOnly";
import { TextWithPhoto } from "./elementTypes/TextWithPhoto";

interface Props {
  element: ElementInterface
  onEdit?: (section: SectionInterface, element: ElementInterface) => void
}

export const Element: React.FC<Props> = props => {

  const getAddElement = (sort: number) => {
    return (<DroppableArea accept="element" onDrop={(data) => props.onEdit(null, { sectionId: props.element.sectionId, elementType: data.elementType, sort })} />);
    //return (<div style={{ textAlign: "center", background: "rgba(230,230,230,0.25)" }}><SmallButton icon="add" onClick={() => props.onEdit(null, { sectionId: props.element.sectionId, elementType: "textWithPhoto", sort })} toolTip="Add Element" /></div>)
  }

  let result = <div style={{ minHeight: 100 }}>Unknown type: {props.element.elementType}</div>

  switch (props.element.elementType) {
    case "text":
      result = <TextOnly element={props.element as ElementInterface} />
      break;
    case "textWithPhoto":
      result = <TextWithPhoto element={props.element as ElementInterface} />
      break;
    case "row":
      result = <RowElement element={props.element as ElementInterface} onEdit={props.onEdit} />
      break;
    case "map":
      result = <h2>Google Map Goes Here</h2>
      break;
  }

  if (props.onEdit) {
    result = <><div className="elementWrapper">
      <span className="elementEditButton">
        <SmallButton icon="edit" onClick={() => props.onEdit(null, props.element)} />
      </span>
      {result}
    </div>
      {props.onEdit && getAddElement(props.element.sort + 1)}
    </>
  }
  return <div style={{ position: "relative" }}>{result}</div>;
}
