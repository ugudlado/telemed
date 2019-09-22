import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextBox from './common/TextBox';
import DateTimePicker from './common/DateTimePicker';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            display: 'flex',
            flexWrap: 'wrap',
            padding: theme.spacing(2)
        }
    }),
);

export default function SearchPatient() {
    const classes = useStyles();

    return (
        <form className={classes.container} noValidate autoComplete="off">
            <Grid
                container
                direction="row"
                spacing={2}
            >
            <Grid item xs={6} ><TextBox label="Search Elxr Id, Mobile" initialValue="" onChange={(txt) => console.log(txt)} /></Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={3}><TextBox label="First Name" initialValue="" onChange={(txt) => console.log(txt)} /></Grid>
                <Grid item xs={3}><TextBox label="Last Name" initialValue="" onChange={(txt) => console.log(txt)} /></Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={3}><TextBox label="Mobile" initialValue="" onChange={(txt) => console.log(txt)} /></Grid>
                <Grid item xs={3}><DateTimePicker id="Dob" format="dd/MM/yyyy" label="Date of Birth" /></Grid>
            </Grid>

        </form>
    );
}