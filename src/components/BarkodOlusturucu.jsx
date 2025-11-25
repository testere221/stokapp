import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import './BarkodOlusturucu.css'

function BarkodOlusturucu({ barkod, urunAdi }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (barkod && canvasRef.current) {
      try {
        JsBarcode(canvasRef.current, barkod, {
          format: 'CODE128',
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 16,
          textMargin: 5,
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
  }, [barkod])

  if (!barkod) {
    return (
      <div className="barkod-placeholder">
        <p>Barkod numarası girin</p>
      </div>
    )
  }

  return (
    <div className="barkod-container">
      {urunAdi && (
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
    </div>
  )
}

export default BarkodOlusturucu

