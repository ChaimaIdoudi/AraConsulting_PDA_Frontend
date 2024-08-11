import React, { useState } from "react";
import { useZxing } from "react-zxing";

const BarcodeScanner = () => {
  const [result, setResult] = useState("");
  const { ref } = useZxing({
    onDecodeResult: (result) => {
      setResult(result.getText());
    },
  });

  return (
    <div>
   
      <video ref={ref} style={{ width: "100%", maxWidth: "400px" }} />
      <p>{result}</p>
    </div>
  );
};

export default BarcodeScanner;
