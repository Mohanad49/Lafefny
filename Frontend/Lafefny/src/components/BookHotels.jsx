/* eslint-disable no-unused-vars */
// BookHotels.jsx
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { FixedSizeGrid } from 'react-window';
import { calculateGridDimensions } from '../utils/windowUtils';
import axios from 'axios';
import '../styles/bookHotels.css';

const BookHotels = () => {
  // State initialization
  const [searchParams, setSearchParams] = useState({
    cityCode: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    roomQuantity: 1
  });

  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({
    currentBatch: 0,
    totalBatches: 0,
    processed: 0,
    total: 0
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    gridDimensions: null
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 20,
    totalPages: 0
  });

  const containerRef = useRef(null);
  const gridRef = useRef(null);

  // Effects
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const gridDimensions = calculateGridDimensions(width, height, hotels);
        setDimensions({ width, height, gridDimensions });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [hotels]);

  useEffect(() => {
    if (hotels.length > 0) {
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(hotels.length / prev.itemsPerPage)
      }));
    }
  }, [hotels]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setHotels([]);
    setProgress({
      currentBatch: 0,
      totalBatches: 0,
      processed: 0,
      total: 0
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));

    try {
      const response = await fetch('http://localhost:8000/amadeus/search-hotels?' + 
        new URLSearchParams({
          cityCode: searchParams.cityCode.toUpperCase(),
          checkInDate: searchParams.checkInDate,
          checkOutDate: searchParams.checkOutDate,
          adults: searchParams.adults,
          roomQuantity: searchParams.roomQuantity
        }));

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          const eventData = JSON.parse(line.slice(6));

          switch(eventData.type) {
            case 'batch':
              { const { hotels: newHotels, progress: batchProgress } = eventData.data;
              setHotels(prev => [...prev, ...newHotels]);
              setProgress(batchProgress);
              break; }

            case 'error':
              throw new Error(eventData.error);

            case 'complete':
              setIsLoading(false);
              return;
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message || 'Failed to fetch hotels');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({
      ...prev,
      currentPage: pageNumber
    }));
    gridRef.current?.scrollTo({ top: 0 });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Memoized values
  const visibleHotels = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    return hotels.slice(start, start + pagination.itemsPerPage);
  }, [hotels, pagination.currentPage, pagination.itemsPerPage]);

  // Grid Cell component
  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    const { gridDimensions } = dimensions;
    if (!gridDimensions) return null;

    const index = rowIndex * gridDimensions.columns + columnIndex;
    const hotel = visibleHotels[index];

    if (!hotel) return null;

    return (
      <div style={{...style, padding: '10px'}}>
        <div className="hotel-card">
          <div className="hotel-image-wrapper">
            {hotel.hotel?.media?.[0]?.uri ? (
              <img 
                src={hotel.hotel.media[0].uri}
                alt={hotel.hotel.name}
                className="hotel-image"
                onError={(e) => e.target.src = '/hotel-placeholder.jpg'}
              />
            ) : (
              <div className="hotel-image-placeholder">
                <i className="fas fa-hotel"></i>
              </div>
            )}
            
            {hotel.hotel?.rating && (
              <div className="hotel-rating">
                <span>★ {hotel.hotel.rating}</span>
              </div>
            )}
          </div>

          <div className="hotel-content">
            <h3 className="hotel-name">{hotel.hotel?.name || 'Unnamed Hotel'}</h3>
            
            <div className="hotel-location">
              <i className="fas fa-map-marker-alt"></i>
              <span>{hotel.hotel?.address?.lines?.join(', ') || 'Address not available'}</span>
            </div>

            {hotel.offers?.[0]?.price && (
              <div className="hotel-price">
                <span className="price-amount">
                  {hotel.offers[0].price.currency} {hotel.offers[0].price.total}
                </span>
                <span className="price-night">/night</span>
              </div>
            )}

            <button className="view-details-btn">View Details</button>
          </div>
        </div>
      </div>
    );
  }, [dimensions, visibleHotels]);

  // Pagination Controls component
  const PaginationControls = () => (
    <div className="pagination-controls">
      <button 
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={pagination.currentPage === 1}
        className="pagination-button"
      >
        Previous
      </button>
      <span className="page-info">
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>
      <button 
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={pagination.currentPage === pagination.totalPages}
        className="pagination-button"
      >
        Next
      </button>
    </div>
  );

  // Render
  return (
    <div className="book-hotels-container" ref={containerRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-group">
          <label>City Code (e.g., PAR, LON, NYC)</label>
          <input
            type="text"
            name="cityCode"
            value={searchParams.cityCode}
            onChange={handleChange}
            placeholder="Enter 3-letter city code"
            maxLength="3"
            required
          />
        </div>

        <div className="form-group">
          <label>Check-in Date</label>
          <input
            type="date"
            name="checkInDate"
            value={searchParams.checkInDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="form-group">
          <label>Check-out Date</label>
          <input
            type="date"
            name="checkOutDate"
            value={searchParams.checkOutDate}
            onChange={handleChange}
            min={searchParams.checkInDate || new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="form-group">
          <label>Number of Adults</label>
          <input
            type="number"
            name="adults"
            value={searchParams.adults}
            onChange={handleChange}
            min="1"
            max="9"
            required
          />
        </div>

        <div className="form-group">
          <label>Number of Rooms</label>
          <input
            type="number"
            name="roomQuantity"
            value={searchParams.roomQuantity}
            onChange={handleChange}
            min="1"
            max="9"
            required
          />
        </div>

        <button type="submit" className="search-button" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search Hotels'}
        </button>
      </form>

      {progress.currentBatch > 0 && (
        <div className="progress-indicator">
          <div className="batch-progress">
            <span>Batch {progress.currentBatch} of {progress.totalBatches}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${(progress.processed / progress.total) * 100}%`}}
              />
            </div>
          </div>
        </div>
      )}

      {visibleHotels.length > 0 && dimensions.gridDimensions && (
        <div className="hotels-section">
          <FixedSizeGrid
            className="hotels-grid"
            columnCount={dimensions.gridDimensions.columns}
            columnWidth={dimensions.gridDimensions.cardWidth}
            height={Math.min(
              dimensions.gridDimensions.totalHeight,
              dimensions.height * 0.7
            )}
            rowCount={dimensions.gridDimensions.rows}
            rowHeight={dimensions.gridDimensions.cardHeight}
            width={dimensions.gridDimensions.totalWidth}
            ref={gridRef}
          >
            {Cell}
          </FixedSizeGrid>
          <PaginationControls />
        </div>
      )}

      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Finding hotels...</p>
        </div>
      )}

      {!isLoading && hotels.length === 0 && !error && (
        <div className="no-results">
          <p>No hotels found. Try different search criteria.</p>
          <ul>
            <li>Use valid city code (e.g., LON, PAR, NYC)</li>
          </ul>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleSubmit} className="retry-button">
            Retry Search
          </button>
        </div>
      )}

      {showScrollTop && (
        <button 
          className="scroll-top-button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default BookHotels;