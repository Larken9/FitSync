import React, { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

function TestBarcodeScanner() {
  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState("");

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Test Barcode Scanner</h1>
      <BarcodeScannerComponent
        width={300}
        height={300}
        onUpdate={(err, result) => {
          if (result) {
            setBarcode(result.text);
            setError("");
          } else if (err) {
            console.error(err);
            setError(err.message);
          }
        }}
      />
      <p>
        <strong>Scanned Barcode:</strong> {barcode}
      </p>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default TestBarcodeScanner;
