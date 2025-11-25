import { useEffect, useRef, useState } from 'react'
import JsBarcode from 'jsbarcode'
import './BarkodOlusturucu.css'

function BarkodOlusturucu({ barkod, urunAdi, compact = false, showDownloadButton = true, onImageClick }) {
  const canvasRef = useRef(null)
  const fullSizeCanvasRef = useRef(null)
  const [showFullSize, setShowFullSize] = useState(false)

  useEffect(() => {
    if (barkod && canvasRef.current) {
      try {
        const options = compact ? {
          format: 'CODE128',
          width: 1.5,
          height: 40,
          displayValue: false,
          margin: 5,
          background: '#ffffff',
          lineColor: '#000000'
        } : {
          format: 'CODE128',
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 16,
          margin: 10,
          background: '#ffffff',
          lineColor: '#000000',
          textAlign: 'center',
          textPosition: 'bottom',
          textMargin: 5
        }
        
        JsBarcode(canvasRef.current, barkod, options)
      } catch (error) {
        console.error('Barkod oluşturma hatası:', error)
      }
    }
  }, [barkod, compact])

  useEffect(() => {
    if (showFullSize && barkod && fullSizeCanvasRef.current) {
      try {
        JsBarcode(fullSizeCanvasRef.current, barkod, {
          format: 'CODE128',
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 16,
          margin: 10,
          background: '#ffffff',
          lineColor: '#000000',
          textAlign: 'center',
          textPosition: 'bottom',
          textMargin: 5
        })
      } catch (error) {
        console.error('Barkod oluşturma hatası:', error)
      }
    }
  }, [showFullSize, barkod])

  if (!barkod) {
    return (
      <div className="barkod-placeholder">
        <p>Barkod numarası girin</p>
      </div>
    )
  }

  const handleClick = () => {
    if (compact && onImageClick) {
      onImageClick()
    } else if (compact) {
      setShowFullSize(true)
    }
  }

  if (compact) {
    return (
      <>
        <div 
          className="barkod-compact" 
          onClick={handleClick}
          title="Tam boyut görmek için tıklayın"
        >
          <canvas ref={canvasRef} className="barkod-canvas-compact"></canvas>
        </div>
        {showFullSize && (
          <div className="barkod-fullsize-overlay" onClick={() => setShowFullSize(false)}>
            <div className="barkod-fullsize-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="barkod-fullsize-close"
                onClick={() => setShowFullSize(false)}
              >
                ✕
              </button>
              <div className="barkod-wrapper">
                <canvas 
                  ref={fullSizeCanvasRef}
                  className="barkod-canvas"
                ></canvas>
              </div>
              <div className="barkod-number">{barkod}</div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="barkod-container">
      {urunAdi && urunAdi.trim() !== '' && (
        <div className="barkod-label">
          <strong>{urunAdi}</strong>
        </div>
      )}
      <div className="barkod-wrapper">
        <canvas ref={canvasRef} className="barkod-canvas"></canvas>
      </div>
      <div className="barkod-number">
        {barkod}
      </div>
      {showDownloadButton && (
        <button
          className="btn btn-primary btn-small"
          onClick={() => {
            const canvas = canvasRef.current
            if (canvas) {
              const link = document.createElement('a')
              link.download = `barkod-${barkod}.png`
              link.href = canvas.toDataURL('image/png')
              link.click()
            }
          }}
        >
          📥 Barkodu İndir
        </button>
      )}
    </div>
  )
}

export default BarkodOlusturucu

