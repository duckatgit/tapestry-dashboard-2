'use client'

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Divider, 
  List, 
  ListItem, 
  ListItemText 
} from '@mui/material';

interface Contact {
  email: string;
  firstName: string;
  lastName: string;
  position: string;
}

interface CompanyDetailsProps {
  name: string;
  summary: string;
  email: string;
  domain: string;
  contacts: Contact[];
  linkedIn?: string;
}

const CompanyDetails = ({ name, summary, email, domain, contacts, linkedIn }: CompanyDetailsProps) => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Company Information: {name}
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Generated Summary:</Typography>
          <Typography variant="body1">{summary}</Typography>
        </CardContent>
      </Card>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Generated Email:</Typography>
          <TextField
            multiline
            fullWidth
            rows={10}
            value={email}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
          />
        </CardContent>
      </Card>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Inferred Domain:</Typography>
        <Typography variant="body1">{domain}</Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Typography variant="h6" gutterBottom>Contact Emails:</Typography>
      {contacts && contacts.length > 0 ? (
        <List>
          {contacts.map((contact, index) => (
            <ListItem key={index} divider={index < contacts.length - 1}>
              <ListItemText
                primary={`${contact.email}`}
                secondary={`Name: ${contact.firstName} ${contact.lastName} | Position: ${contact.position}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Box>
          <Typography variant="body1" color="text.secondary">No emails found.</Typography>
          {linkedIn && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>LinkedIn URL:</Typography>
              <Typography variant="body1">
                <a href={linkedIn} target="_blank" rel="noopener noreferrer">
                  {name} LinkedIn Page
                </a>
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CompanyDetails; 