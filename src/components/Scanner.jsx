import React, { useEffect, useState, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ScanLine, X, Keyboard } from 'lucide-react';
import './Scanner.css';

const Scanner = ({ onScanSuccess, isSearching }) => {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManual, setShowManual] = useState(false);

  const startScan = useCallback(() => setScanning(true), []);
  const stopScan = useCallback(() => setScanning(false), []);

  useEffect(() => {
    if (!scanning) return;
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 260, height: 160 }, aspectRatio: 1.0 },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear().catch(console.error);
        setScanning(false);
        onScanSuccess(decodedText);
      },
      () => {} // ignore scan failures
    );

    return () => { scanner.clear().catch(console.error); };
  }, [scanning, onScanSuccess]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim() && !isSearching) {
      onScanSuccess(manualCode.trim());
      setManualCode('');
      setShowManual(false);
    }
  };

  return (
    <div className="scanner-page">
      <header className="scanner-page__header">
        <h1 className="scanner-page__title">Scan Product</h1>
        <p className="scanner-page__sub">Point at any barcode or QR code to compare prices</p>
      </header>

      {!scanning ? (
        <div className="scanner-idle">
          <div className="scanner-idle__frame">
            <div className="scanner-idle__corners" />
            <div className="scanner-idle__inner">
              <ScanLine size={40} className="scanner-idle__icon" />
              <p>Ready to scan</p>
            </div>
          </div>

          <button
            className="scanner-idle__btn"
            onClick={startScan}
            disabled={isSearching}
            id="start-scan-btn"
          >
            <ScanLine size={20} />
            {isSearching ? 'Processing…' : 'Start Camera Scan'}
          </button>

          <button
            className="scanner-idle__manual-toggle"
            onClick={() => setShowManual(v => !v)}
            id="manual-toggle-btn"
          >
            <Keyboard size={15} />
            Enter barcode manually
          </button>

          {showManual && (
            <form className="scanner-manual" onSubmit={handleManualSubmit}>
              <input
                id="manual-barcode-input"
                type="text"
                placeholder="e.g. 1234567890128"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                autoFocus
              />
              <button type="submit" disabled={!manualCode.trim() || isSearching} id="manual-submit-btn">
                Search
              </button>
            </form>
          )}

          <div className="scanner-test-hint">
            <p>Test barcodes:</p>
            <div className="scanner-test-chips">
              {['1234567890128', '9876543210987', '0123456789012'].map(code => (
                <button
                  key={code}
                  className="test-chip"
                  onClick={() => onScanSuccess(code)}
                  id={`test-${code}`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="scanner-active">
          <div className="scanner-active__header">
            <span>Align barcode in frame</span>
            <button className="scanner-active__close" onClick={stopScan} id="stop-scan-btn">
              <X size={20} />
            </button>
          </div>
          <div id="qr-reader" className="scanner-active__reader" />
          <p className="scanner-active__hint">Supports EAN, UPC, QR codes</p>
        </div>
      )}
    </div>
  );
};

export default Scanner;
