import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ScanLine, XCircle } from 'lucide-react';
import './Scanner.css';

const Scanner = ({ onScanSuccess }) => {
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let scanner = null;
    if (scanning) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.0 },
        false
      );
      
      const handleScanSuccess = (decodedText, decodedResult) => {
        onScanSuccess(decodedText);
        // Play a beep sound optionally here
        setScanning(false);
        scanner.clear().catch(console.error);
      };

      const handleScanFailure = (error) => {
        // Many failures are just normal frame scans that don't find a barcode
        // So we only log or ignore
      };

      scanner.render(handleScanSuccess, handleScanFailure);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [scanning, onScanSuccess]);

  return (
    <div className="scanner-container">
      {!scanning ? (
        <button className="scan-btn" onClick={() => setScanning(true)}>
          <ScanLine className="icon" size={24} />
          <span>Start Scanning</span>
        </button>
      ) : (
        <div className="scanner-active">
          <div className="scanner-header">
            <h3>Align Barcode in Frame</h3>
            <button className="close-btn" onClick={() => setScanning(false)}>
              <XCircle size={24} />
            </button>
          </div>
          <div id="qr-reader" className="qr-reader"></div>
          <p className="scanner-hint">Point your camera at a product barcode (EAN/UPC)</p>
        </div>
      )}
      {errorMsg && <p className="error-msg">{errorMsg}</p>}
    </div>
  );
};

export default Scanner;
