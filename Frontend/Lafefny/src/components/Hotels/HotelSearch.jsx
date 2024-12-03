import React, { useState } from 'react';
import { Box, Button, CircularProgress, TextField, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import HotelSearchResults from './HotelSearchResults';

const HotelSearch = () => {
  const [searchParams, setSearchParams] = useState({
    cityCode: '',
    checkInDate: null,
    checkOutDate: null,
    adults: '2',
    roomQuantity: '1',
  });
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [progress, setProgress] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setHotels([]);
    setProgress(null);

    try {
      const response = await axios.post('http://localhost:8000/amadeus/hotelOffer', {
        ...searchParams,
        checkInDate: searchParams.checkInDate?.toISOString().split('T')[0],
        checkOutDate: searchParams.checkOutDate?.toISOString().split('T')[0],
      }, {
        onDownloadProgress: (progressEvent) => {
          const text = progressEvent.event.target.responseText;
          try {
            // Find the last complete JSON object in the stream
            const lastBracketIndex = text.lastIndexOf('}');
            if (lastBracketIndex !== -1) {
              const lastJsonStr = text.substring(0, lastBracketIndex + 1);
              const lastOpenBracket = lastJsonStr.lastIndexOf('{');
              const jsonStr = lastJsonStr.substring(lastOpenBracket);
              const data = JSON.parse(jsonStr);
              
              if (data.data) {
                setHotels(data.data);
              }
              if (data.progress) {
                setProgress(data.progress);
              }
            }
          } catch (error) {
            console.log('Progress parsing error:', error);
          }
        }
      });

      setHotels(response.data.data);
      setProgress(response.data.progress);
    } catch (error) {
      console.error('Search error:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleDateChange = (field) => (date) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: date
    }));
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <form onSubmit={handleSearch}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="City Code"
              value={searchParams.cityCode}
              onChange={handleInputChange('cityCode')}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Check-in Date"
                value={searchParams.checkInDate}
                onChange={handleDateChange('checkInDate')}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Check-out Date"
                value={searchParams.checkOutDate}
                onChange={handleDateChange('checkOutDate')}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Adults"
              value={searchParams.adults}
              onChange={handleInputChange('adults')}
              InputProps={{ inputProps: { min: 1 } }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Rooms"
              value={searchParams.roomQuantity}
              onChange={handleInputChange('roomQuantity')}
              InputProps={{ inputProps: { min: 1 } }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Search Hotels'}
            </Button>
          </Grid>
        </Grid>
      </form>

      <HotelSearchResults 
        hotels={hotels}
        loading={loading}
        progress={progress}
      />
    </Box>
  );
};

export default HotelSearch;
