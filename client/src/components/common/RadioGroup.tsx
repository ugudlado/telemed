import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import { default as MRadioGroup } from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {FormLabel, Grid} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(3),
    },
    grid: {
      textAlign:"left",
      paddingTop:theme.spacing(2)
    }
  }),
);

interface Props {
  id: string,
  label: string,
  options: Array<Option>
  onChange:(key:string, value:string)=>void
}

export interface Option {
  text: string,
  value: string
}

export default function RadioGroup(props: Props) {
  const classes = useStyles();
  const [value, setValue] = React.useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    props.onChange(props.id, event.target.value);
  }

  const items = props.options.map((option) => (<FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.text} />));


  return (
    <Grid container justify="flex-start" direction="column" className={classes.grid}>
      <Grid item>
        <FormLabel>{props.label}</FormLabel>
      </Grid>
      <Grid item>
        <MRadioGroup aria-label={props.label} name={props.id} value={value} onChange={(e)=>handleChange(e)}>
          {items} 
        </MRadioGroup>
      </Grid>
    </Grid>
  );
}
