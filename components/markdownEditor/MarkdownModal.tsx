import React, { useMemo, useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import { MarkdownPreview } from "./MarkdownPreview";

interface Props {
  hideModal: (newValue: string) => void
  value?: string;
}

const guideLink = <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer" style={{ float: "right" }}>Markdown Guide</a>;


export const MarkdownModal: React.FC<Props> = ({
  value,
  onChange,
  hideModal
}) => {
  const [inputVal, setInputVal] = useState(value);

  useEffect(() => {
    if (value.trim() === inputVal.trim()) return;

    setInputVal(value);
  }, [value]);

  useEffect(() => {
    onChange(inputVal);
  }, [inputVal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }

  return (<Dialog open={true} onClose={() => { hideModal() }} fullScreen={true}>
    <DialogTitle>Markdown Editor</DialogTitle>
    <DialogContent>
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <TextField fullWidth multiline label={<>Content &nbsp; {guideLink}</>} name="modalMarkdown" className="modalMarkdown" InputProps={{ style: { height: "80vh" } }} value={inputVal} onChange={(e) => {
          setInputVal(e.target.value);
        }} placeholder="" />
      </Grid>
      <Grid item xs={6}>
        <div style={{ border: "1px solid #BBB", borderRadius: 5, marginTop: 15, padding: 10, height: "80vh", overflowY: "scroll" }} id="markdownPreview">
          <div style={{ marginTop: -20, marginBottom: -10, position: "absolute" }}><span style={{ backgroundColor: "#FFFFFF", color: "#999", fontSize: 13 }}> &nbsp; Preview &nbsp; </span></div>
          <MarkdownPreview value={inputVal} />
        </div>
      </Grid>
    </Grid>
    </DialogContent>
    <DialogActions sx={{ paddingX: "16px", paddingBottom: "12px" }}>
      <Button variant="outlined" onClick={() => { hideModal() }}>Close</Button>
    </DialogActions>
  </Dialog>)
};
