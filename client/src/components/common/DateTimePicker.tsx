import 'date-fns'
import React, { FunctionComponent } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

interface Props {
    id:string,
    format:string,
    label:string,
}

const DateTimePicker:FunctionComponent<Props> = (props: Props) => {
  // The first commit of Material-UI
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    new Date(Date.now()),
  );

  function handleDateChange(date: Date | null) {
    setSelectedDate(date);
  }

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format={props.format}
          margin="normal"
          id={props.id}
          label={props.label}
          value={selectedDate}
          onChange={handleDateChange}
          fullWidth={true}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
    </MuiPickersUtilsProvider>
  );
}

export default DateTimePicker;