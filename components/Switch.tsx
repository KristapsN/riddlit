import { Box, Typography, Switch } from "@mui/material"
import { group } from "console"

interface SwitchWithLabelProps {
  label: string
  checked: boolean,
  onChange: () => void
}

export const SwitchWithLabel: React.FC<SwitchWithLabelProps>  = ({checked, onChange, label}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography sx={{ color: 'gray' }}>{label}</Typography>
      <Switch
        sx={{
          '.MuiSwitch-thumb': {
            border: '2px solid grey',
          },
          '.MuiSwitch-switchBase.Mui-checked': {
            color: '#FCD0F4',
          },
          '.MuiSwitch-sizeMedium': {
            color: 'grey',
          },
          '.MuiSwitch-track': {
            backgroundColor: 'white',
            border: '2px solid grey',
          },
          '.MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: 'grey',
            border: '2px solid grey',
          },
        }}
        checked={checked} onChange={onChange} />
    </Box>
  )
}
