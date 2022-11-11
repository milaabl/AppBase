import { SmallButton } from "@/appBase/components";
import { ElementInterface, SectionInterface } from "@/helpers";
import { Container, Icon } from "@mui/material";
import { CSSProperties } from "react";
import { DroppableArea } from "./admin/DroppableArea";
import { Element } from "./Element";

interface Props { section: SectionInterface, onEdit?: (section: SectionInterface, element: ElementInterface) => void }

export const Section: React.FC<Props> = props => {

  const getElements = () => {
    const result: JSX.Element[] = []
    props.section.elements.forEach(e => {
      result.push(<Element element={e} onEdit={props.onEdit} />)
    });
    return result;
  }

  const getStyle = () => {
    let result: CSSProperties = {}
    if (props.section.background.indexOf("/") > -1) {
      result = {
        backgroundImage: "url('" + props.section.background + "')"
      };
    } else {
      result = { background: props.section.background };
    }
    return result;
  }

  const getClassName = () => {
    let result = "section";
    if (props.section.background.indexOf("/") > -1) result += " sectionDark"
    return result;
  }

  const getEdit = () => {
    if (props.onEdit) {
      return (<span style={{ position: "absolute", top: 3, right: 3, backgroundColor: "#FFF", borderRadius: 5 }}>
        <SmallButton icon="edit" onClick={() => props.onEdit(props.section, null)} />
      </span>)
    }
  }

  const getAddElement = (sort: number) => {
    return (<DroppableArea accept="element" onDrop={(data) => props.onEdit(null, { sectionId: props.section.id, elementType: data.elementType, sort })} />);
    //return (<div style={{ textAlign: "center", background: "rgba(230,230,230,0.25)" }}><SmallButton icon="add" onClick={() => props.onEdit(null, { sectionId: props.section.id, elementType: "textWithPhoto", sort })} toolTip="Add Element" /></div>)
  }

  return (
    <div style={getStyle()} className={getClassName()}>
      <Container style={{ paddingTop: 40, paddingBottom: 40, position: "relative" }}>
        {props.onEdit && getAddElement(0)}
        {getEdit()}
        {getElements()}
      </Container>
    </div>
  );
}
