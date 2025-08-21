import { useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import BarcodeScanner from './components/BarcodeScanner';

function App() {
  const [code, setCode] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [diag, setDiag] = useState(null);
  const [testMsg, setTestMsg] = useState('');
  const [photoMsg, setPhotoMsg] = useState('');
  const fileInputRef = useRef(null);

  async function runDiagnostics() {
    const info = {
      href: location.href,
      secureContext: window.isSecureContext,
      protocol: location.protocol,
      hostname: location.hostname,
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!navigator.mediaDevices?.getUserMedia,
      devices: []
    };
    try {
      const devices = await navigator.mediaDevices?.enumerateDevices?.();
      info.devices = (devices || []).map(d => ({ kind: d.kind, label: d.label, deviceId: d.deviceId?.slice(0,8)+'...' }));
    } catch (e) {
      info.enumerateError = String(e);
    }
    setDiag(info);
  }

  async function handleTestCamera() {
    setTestMsg('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setTestMsg('getUserMedia not available in this context. Ensure HTTPS and Safari permissions.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      // Immediately stop to just test permission/access
      stream.getTracks().forEach(t => t.stop());
      setTestMsg('Camera access OK (permission granted).');
    } catch (e) {
      setTestMsg(`Camera error: ${e?.name || 'Error'} - ${e?.message || String(e)}`);
    }
  }

  function openPhotoPicker() {
    setPhotoMsg('');
    fileInputRef.current?.click();
  }

  async function onPhotoSelected(e) {
    setPhotoMsg('');
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      // Prepare a reader with common formats
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_93,
        BarcodeFormat.ITF,
        BarcodeFormat.EAN_13,
        BarcodeFormat.UPC_A,
        BarcodeFormat.QR_CODE,
      ]);
      const reader = new BrowserMultiFormatReader(hints, 300);
      const result = await reader.decodeFromImageElement(img);
      const text = result?.getText?.();
      if (text) {
        setCode(text.trim());
        setPhotoMsg('Decoded from photo successfully.');
      } else {
        setPhotoMsg('No barcode found in the selected image.');
      }
    } catch (e) {
      setPhotoMsg(`Photo decode error: ${e?.name || 'Error'} - ${e?.message || String(e)}`);
    } finally {
      e.target.value = '';
    }
  }
  return (
    <div style={{ padding: 16 }}>
      <h1>Barcode Scanner</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => {
            setCode('');
            setScannerActive((v) => !v);
          }}
        >
          {scannerActive ? 'Close Camera' : 'Open Camera'}
        </button>
        <button onClick={runDiagnostics}>Diagnostics</button>
        <button onClick={handleTestCamera}>Test Camera (iOS)</button>
        <button onClick={openPhotoPicker}>Scan from Photo</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={onPhotoSelected}
        />
      </div>
      <BarcodeScanner
        active={scannerActive}
        onResult={(text) => {
          setCode(text?.trim?.() || String(text));
          setScannerActive(false); // auto-close after first successful scan
        }}
      />
      <div style={{ marginTop: 12 }}>
        <strong>Scanned code:</strong> {code || '—'}
      </div>
      {testMsg && (
        <div style={{ marginTop: 8, color: '#444' }}>{testMsg}</div>
      )}
      {photoMsg && (
        <div style={{ marginTop: 8, color: '#444' }}>{photoMsg}</div>
      )}
      {diag && (
        <pre style={{ marginTop: 12, background:'#f5f5f5', padding: 8, maxWidth: 640, overflow: 'auto' }}>
{JSON.stringify(diag, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;