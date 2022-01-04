import React from "react";
import { ChurchInterface } from "../../interfaces";
import { Modal } from "react-bootstrap";
import { SelectChurchSearch } from "./SelectChurchSearch";
import { SelectableChurch } from "./SelectableChurch";
import { ErrorMessages } from "../../components"

interface Props {
  appName: string,
  show: boolean,
  churches?: ChurchInterface[],
  selectChurch: (churchId: string) => void,
  registeredChurchCallback?: (church: ChurchInterface) => void,
  errors?: string[]
}

export const SelectChurchModal: React.FC<Props> = (props) => {
  const [showSearch, setShowSearch] = React.useState(false);

  const getContents = () => {
    if (showSearch || props.churches?.length === 0) return <SelectChurchSearch selectChurch={props.selectChurch} registeredChurchCallback={props.registeredChurchCallback} appName={props.appName} />
    else return (<>
      {props.churches?.map(c => (<SelectableChurch church={c} selectChurch={props.selectChurch} key={c.id} />))}
      <a href="about:blank" style={{ color: "#999", display: "block", textAlign: "center" }} onClick={(e) => { e.preventDefault(); setShowSearch(true); }}>Choose another church</a>
    </>);
  }

  return (
    <Modal show={props.show} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>Select Church</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ErrorMessages errors={props.errors} />
        {getContents()}

      </Modal.Body>
    </Modal>
  );
};
