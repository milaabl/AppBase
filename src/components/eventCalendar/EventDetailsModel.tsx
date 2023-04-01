import "react-big-calendar/lib/css/react-big-calendar.css";
import { EventInterface } from "@/helpers";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import { DisplayBox, InputBox, MarkdownPreview } from "..";

interface Props {
  event: EventInterface;
  onDone?: () => void;
}

export function EventDetailsModel(props: Props) {

  return (
    <Dialog open={true} onClose={props.onDone}>
      <DialogTitle>{props.event.title}</DialogTitle>
      <DialogContent>
        <MarkdownPreview value={props.event.description} />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onDone}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
