import React, { useState } from "react";
import { useZxing } from "react-zxing";

const BarcodeScanner = ({ onScan }) => {
  const { ref } = useZxing({
    onDecodeResult: (result) => {
      if (onScan) {
        onScan(result.getText());
      }
    },
  });

  return (
    <div>
      <video ref={ref} style={{ width: "100%", maxWidth: "400px" }} />
    </div>
  );
};

export default BarcodeScanner;
