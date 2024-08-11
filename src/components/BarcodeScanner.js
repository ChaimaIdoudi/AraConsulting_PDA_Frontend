// src/components/BarcodeScanner.js
import React from 'react';
import BarcodeReader from 'react-barcode-reader';

const BarcodeScanner = ({ onScan, onError }) => {
  return (
    <div>
      <BarcodeReader onScan={onScan} onError={onError} />
      <p>Scan a barcode to add a code manually</p>
    </div>
  );
};

export default BarcodeScanner;
