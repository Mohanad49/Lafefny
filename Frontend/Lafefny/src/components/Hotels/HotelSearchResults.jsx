import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Grid, Card, CardContent, LinearProgress, Fade } from '@mui/material';
import axios from 'axios';

const HotelSearchResults = ({ searchParams, onPageChange }) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    total: 0,
    limit: 20
  });

  const searchHotels = async (page = 1) => {
    setLoading(true);
    setError('');
    setHotels([]);

    const queryParams = new URLSearchParams({
      ...searchParams,
      page,
      limit: pagination.limit
    });

    const eventSource = new EventSource(
      `http://localhost:8000/amadeus/search-hotels?${queryParams}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received event:', data);
    };

    eventSource.addEventListener('hotels', (event) => {
      const data = JSON.parse(event.data);
      setHotels(prevHotels => [...prevHotels, ...data.hotels]);
      setProgress(data.progress);
    });

    eventSource.addEventListener('pagination', (event) => {
      const data = JSON.parse(event.data);
      setPagination(data);
    });

    eventSource.addEventListener('error', (event) => {
      const data = JSON.parse(event.data);
      setError(data.error || 'Failed to fetch hotels');
      eventSource.close();
      setLoading(false);
    });

    eventSource.addEventListener('complete', () => {
      eventSource.close();
      setLoading(false);
    });

    // Clean up on unmount
    return () => {
      eventSource.close();
    };
  };

  const handlePageChange = (newPage) => {
    searchHotels(newPage);
  };

  const renderHotelCard = (hotel) => {
    const defaultImage = '/hotel-placeholder.jpg';
    const hotelOffer = hotel.offers?.[0];
    const address = hotel.hotel?.address?.lines?.join(', ') || 'Address not available';
    
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
          {hotel.hotel?.media?.[0]?.uri ? (
            <img
              src={hotel.hotel.media[0].uri}
              alt={hotel.hotel.name}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => e.target.src = defaultImage}
            />
          ) : (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.200'
              }}
            >
              <Typography variant="h5">No Image Available</Typography>
            </Box>
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            {hotel.hotel?.name || 'Unnamed Hotel'}
          </Typography>

          {hotel.hotel?.rating && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Rating: {hotel.hotel.rating} ★
            </Typography>
          )}

          <Typography variant="body2" color="text.secondary" paragraph>
            {address}
          </Typography>

          {hotelOffer && (
            <Typography variant="h6" color="primary">
              {hotelOffer.price.currency} {hotelOffer.price.total}
              <Typography variant="caption" color="text.secondary"> /night</Typography>
            </Typography>
          )}

          {hotel.hotel?.amenities && (
            <Box sx={{ mt: 1 }}>
              {hotel.hotel.amenities.slice(0, 3).map((amenity, idx) => (
                <Typography
                  key={idx}
                  variant="caption"
                  sx={{
                    mr: 1,
                    px: 1,
                    py: 0.5,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    display: 'inline-block'
                  }}
                >
                  {amenity}
                </Typography>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Searching for hotels...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {progress && (
        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={(progress.processed / progress.total) * 100}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                  }
                }}
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">
                {Math.round((progress.processed / progress.total) * 100)}%
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Batch {progress.currentBatch} of {progress.totalBatches}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Found {hotels.length} hotels
            </Typography>
          </Box>
        </Box>
      )}

      <Grid container spacing={3}>
        {hotels.map((hotel, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            {renderHotelCard(hotel)}
          </Grid>
        ))}
      </Grid>

      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          {[...Array(pagination.totalPages)].map((_, idx) => (
            <Box
              key={idx}
              sx={{
                mx: 0.5,
                px: 2,
                py: 1,
                borderRadius: 1,
                cursor: 'pointer',
                bgcolor: pagination.page === idx + 1 ? 'primary.main' : 'grey.200',
                color: pagination.page === idx + 1 ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: pagination.page === idx + 1 ? 'primary.dark' : 'grey.300'
                }
              }}
              onClick={() => handlePageChange(idx + 1)}
            >
              {idx + 1}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default HotelSearchResults;
