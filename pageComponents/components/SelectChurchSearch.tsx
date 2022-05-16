import React from "react";
import { InputGroup, Button, FormControl } from "react-bootstrap";
import { ApiHelper } from "../../helpers"
import { ChurchInterface } from "../../interfaces";
import { SelectableChurch } from "./SelectableChurch";
import { SelectChurchRegister } from "./SelectChurchRegister";

interface Props {
  selectChurch: (churchId: string) => void,
  registeredChurchCallback?: (church: ChurchInterface) => void,
  appName: string
}

export const SelectChurchSearch: React.FC<Props> = (props) => {
  const [searchText, setSearchText] = React.useState("");
  const [churches, setChurches] = React.useState<ChurchInterface[]>(null);
  const [showRegister, setShowRegister] = React.useState(false);

  const handleSubmit = (e: React.MouseEvent) => {
    if (e !== null) e.preventDefault();
    let term = escape(searchText.trim());
    // ApiHelper.getAnonymous("/churches/search?name=" + escape(term), "AccessApi").then(data => setChurches(data));
    ApiHelper.post("/churches/search", { name: term }, "AccessApi").then(data => setChurches(data));
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.currentTarget.value);

  const handleKeyDown = (e: React.KeyboardEvent<any>) => { if (e.key === "Enter") { e.preventDefault(); handleSubmit(null); } }

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm("Are you sure you wish to register a new church?")) {
      setShowRegister(true);
    }
  }

  const getRegisterLink = () => (
    <div>
      <a style={{ color: "#999", display: "block", textAlign: "center" }} href="about:blank" onClick={handleRegisterClick}>
        Register a New Church
      </a>
    </div>
  )

  const getChurches = () => {
    const result: JSX.Element[] = [];
    churches.forEach(church => {
      result.push(<SelectableChurch church={church} selectChurch={props.selectChurch} />);
    });
    result.push(getRegisterLink());
    return result;
  }

  const getResults = () => {
    if (churches === null) return;
    else if (churches.length === 0) return <><p>No matches found</p>{getRegisterLink()}</>
    else return getChurches();
  }

  if (showRegister) return (<SelectChurchRegister selectChurch={props.selectChurch} registeredChurchCallback={props.registeredChurchCallback} appName={props.appName} initialChurchName={searchText} />)
  else return (
    <>
      <InputGroup>
        <FormControl id="searchText" aria-label="searchBox" name="searchText" type="text" placeholder="Name" value={searchText} onChange={handleChange} onKeyDown={handleKeyDown} />
        <Button id="searchButton" variant="primary" onClick={handleSubmit}>Search</Button>
      </InputGroup>
      {getResults()}
    </>

  );
};
