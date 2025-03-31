/* eslint-disable react/prop-types */
import React, { useState, FC } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import { useTheme, makeStyles } from '@mui/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import CheckIcon from '@mui/icons-material/Check';
import AmountDisplay from './AmountDisplay';
import { WalletActionInput, WalletActionOutput } from '@bsv/sdk';

const useStyles = makeStyles(
  {
    txid: {
      fontFamily: 'monospace',
      color: 'textSecondary',
      userSelect: 'all',
      fontSize: '1em',
      '@media (max-width: 1000px) and (min-width: 401px)': {
        fontSize: '0.75em',
      },
      '@media (max-width: 400px) and (min-width: 0px)': {
        fontSize: '0.7em',
      },
    },
  },
  {
    name: 'RecentActions',
  }
);


interface ActionProps {
  txid: string;
  description: string;
  amount: string | number;
  inputs: WalletActionInput[];
  outputs: WalletActionOutput[];
  fees?: string | number;
  timestamp: string;
  onClick?: () => void;
  isExpanded?: boolean;
}

const Action: FC<ActionProps> = ({
  txid,
  description,
  amount,
  inputs,
  outputs,
  fees,
  timestamp,
  onClick,
  isExpanded,
}) => {
  const [expanded, setExpanded] = useState<boolean>(isExpanded || false);
  const [copied, setCopied] = useState<boolean>(false);
  const theme = useTheme();
  const classes = useStyles();

  const determineAmountColor = (amount: string | number): string => {
    const amountAsString = amount.toString()[0];
    if (amountAsString !== '-' && !isNaN(Number(amountAsString))) {
      return 'green';
    } else if (amountAsString === '-') {
      return 'red';
    } else {
      return 'black';
    }
  };

  const handleExpand = () => {
    if (isExpanded !== undefined) {
      setExpanded(isExpanded);
    } else {
      setExpanded(!expanded);
    }
    if (onClick) {
      onClick();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(txid);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const splitString = (str: string, length: number): [string, string] => {
    if (str === undefined || str === null) {
      str = '';
    }
    const firstLine = str.slice(0, length);
    const secondLine = str.slice(length);
    return [firstLine, secondLine];
  };

  const [firstLine, secondLine] = splitString(txid, 32);

  const getTimeAgo = (timestamp: string): string => {
    try {
      const currentTime = new Date();
      const diff = currentTime.getTime() - new Date(timestamp).getTime();

      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const years = Math.floor(days / 365);

      if (years > 0) {
        return years === 1 ? `${years} year ago` : `${years} years ago`;
      } else if (days > 0) {
        return days === 1 ? `${days} day ago` : `${days} days ago`;
      } else if (hours > 0) {
        return hours === 1 ? `${hours} hour ago` : `${hours} hours ago`;
      } else if (minutes > 0) {
        return minutes === 1 ? `${minutes} minute ago` : `${minutes} minutes ago`;
      } else {
        if (isNaN(minutes)) {
          return 'Unknown';
        }
        return 'Just now';
      }
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <Accordion expanded={expanded} onChange={handleExpand}>
      <AccordionSummary
        style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
        expandIcon={<ExpandMoreIcon />}
        aria-controls="transaction-details-content"
        id="transaction-details-header"
      >
        <Grid container direction="column">
          <Grid item>
            <Typography
              variant="h5"
              style={{ color: 'textPrimary', wordBreak: 'break-all' }}
            >
              {description}
            </Typography>
          </Grid>
          <Grid item>
            <Grid container justifyContent="space-between">
              <Grid item>
                <Typography variant="h6" style={{ color: determineAmountColor(amount) }}>
                  <AmountDisplay showPlus>{amount}</AmountDisplay>
                </Typography>
              </Grid>
              <Grid item paddingRight="1em">
                <Typography variant="body2" style={{ color: 'textSecondary' }}>
                  {getTimeAgo(timestamp)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails
        style={{
          padding: '1.5em',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <div>
          <Typography>TXID</Typography>
          <Grid container direction="row">
            <Grid item sx={9} style={{ paddingRight: '0.5em' }}>
              <div>
                <Typography variant="body1" className={classes.txid}>
                  {firstLine}
                </Typography>
              </div>
              <div>
                <Typography variant="body1" className={classes.txid}>
                  {secondLine}
                </Typography>
              </div>
            </Grid>
            <Grid item sx={3}>
              <IconButton onClick={handleCopy} disabled={copied}>
                {copied ? <CheckIcon /> : <FileCopyIcon />}
              </IconButton>
            </Grid>
          </Grid>
          <Snackbar
            open={copied}
            autoHideDuration={2000}
            onClose={() => setCopied(false)}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            style={{ paddingRight: '1em' }}
          >
            <Alert severity="success">Copied!</Alert>
          </Snackbar>
          {inputs && inputs.length !== 0 && <Typography variant="h6">Inputs</Typography>}
          <div style={{ marginLeft: '0.5em' }}>
            <Grid container direction="column" style={{ padding: '0.5em' }}>
              {inputs ? inputs.map((input, index) => (
                <div key={index}>
                  <Grid container direction="row">
                    <Grid item style={{ paddingRight: '0.6em' }}>
                      <Typography variant="h6">{`${index + 1}.`}</Typography>
                    </Grid>
                    <Grid item maxWidth="22em">
                      <Typography
                        variant="body1"
                        style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}
                      >
                        {input.inputDescription}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item style={{ marginLeft: '1.7em', paddingRight: '1em' }}>
                    <Typography variant="body2">
                      <AmountDisplay description={input.inputDescription}>{input.sourceSatoshis}</AmountDisplay>
                    </Typography>
                  </Grid>
                </div>
              )) : ''}
            </Grid>
          </div>
          {outputs && outputs.length !== 0 && <Typography variant="h6">Outputs</Typography>}
          <div style={{ marginLeft: '0.5em' }}>
            <Grid container direction="column" style={{ padding: '0.5em' }}>
              {outputs ? outputs.map((output, index) => (
                <div key={index}>
                  <Grid container>
                    <Grid item style={{ paddingRight: '0.6em' }}>
                      <Typography variant="h6">{`${index + 1}.`}</Typography>
                    </Grid>
                    <Grid item maxWidth="22em">
                      <Typography
                        variant="body1"
                        style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}
                      >
                        {output.outputDescription}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item style={{ marginLeft: '1.7em', paddingRight: '1em' }}>
                    <Typography variant="body2">
                      <AmountDisplay description={output.outputDescription}>{output.satoshis}</AmountDisplay>
                    </Typography>
                  </Grid>
                </div>
              )) : ''}
            </Grid>
          </div>
          {fees !== undefined && (
            <>
              <Typography variant="h6">Fees</Typography>
              <div style={{ marginLeft: '0.5em' }}>
                <Typography variant="body2">
                  <AmountDisplay description="Transaction and commission fees">{fees}</AmountDisplay>
                </Typography>
              </div>
            </>
          )}
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

export default Action;
