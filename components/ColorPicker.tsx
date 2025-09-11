import { Box, Button, Popover, Typography } from "@mui/material";
import { Fragment, useState } from "react";
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  color: string
  onChange: (e: string) => void
  label?: string
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <Fragment>
      <Box sx={{ display: 'flex', alignItems: "center" }}>
        <Typography sx={{ color: 'grey' }}>{label}</Typography>
        <Button sx={{
          backgroundColor: color,
          height: '30px',
          width: '30px',
          '&.MuiButton-root': {
            minWidth: '20px',
          },
          '&:hover': {
            backgroundColor: color,
          },
        }} variant="contained" size="small" onClick={handleClick} />
      </Box>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <HexColorPicker color={color} onChange={onChange} />
      </Popover>
    </Fragment>
  )

};
