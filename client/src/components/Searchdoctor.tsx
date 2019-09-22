import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextBox from './common/TextBox';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            display: 'flex',
            flexWrap: 'wrap',
            padding: theme.spacing(2)
        }
    }),
);

export default function SearchDoctor() {
    const classes = useStyles();

    return (
        <form className={classes.container} noValidate autoComplete="off">
            <Grid container spacing={2}>
                <Grid item xs={3}><TextBox label="Doctor Name" initialValue="" onChange={(txt) => console.log(txt)} /></Grid>
                <Grid item xs={3}><TextBox label="Specialty" initialValue="" onChange={(txt) => console.log(txt)} /></Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={3}><TextBox label="Reason" initialValue="" onChange={(txt) => console.log(txt)} /></Grid>
                <Grid item xs={3}><TextBox label="Priority" initialValue="" onChange={(txt) => console.log(txt)} /></Grid>
            </Grid>
        </form>
    );
}