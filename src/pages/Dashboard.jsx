import { useEffect, useState } from 'react'
import { subscribeEksikUrunler, subscribeFazlaUrunler } from '../utils/supabase-storage'
import BarkodOlusturucu from '../components/BarkodOlusturucu'
import './Dashboard.css'

function Dashboard() {
  const [eksikUrunler, setEksikUrunler] = useState([])
  const [fazlaUrunler, setFazlaUrunler] = useState([])
  const [arama, setArama] = useState('')
  const [aramaSonuclari, setAramaSonuclari] = useState([])
  const [seciliUrun, setSeciliUrun] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detayUrun, setDetayUrun] = useState(null)
  const [showUrunDetayModal, setShowUrunDetayModal] = useState(false)

  useEffect(() => {
    // Gerçek zamanlı dinleme - Eksik Ürünler
    const unsubscribeEksik = subscribeEksikUrunler((urunler) => {
      setEksikUrunler(urunler)
    })

    // Gerçek zamanlı dinleme - Fazla Ürünler
    const unsubscribeFazla = subscribeFazlaUrunler((urunler) => {
      setFazlaUrunler(urunler)
    })

    return () => {
      unsubscribeEksik()
      unsubscribeFazla()
    }
  }, [])

  const toplamEksikMiktar = eksikUrunler.reduce((toplam, urun) => toplam + (urun.miktar || 0), 0)
  const toplamFazlaMiktar = fazlaUrunler.reduce((toplam, urun) => toplam + (urun.miktar || 0), 0)
  const toplamEksikUrunSayisi = eksikUrunler.length
  const toplamFazlaUrunSayisi = fazlaUrunler.length

  // En çok eksik olan 5 ürün
  const enCokEksikUrunler = [...eksikUrunler]
    .sort((a, b) => (b.miktar || 0) - (a.miktar || 0))
    .slice(0, 5)

  // En çok fazla olan 5 ürün
  const enCokFazlaUrunler = [...fazlaUrunler]
    .sort((a, b) => (b.miktar || 0) - (a.miktar || 0))
    .slice(0, 5)

  const handleArama = (e) => {
    e.preventDefault()
    const aramaTerimi = arama.trim().toLowerCase()
    
    if (!aramaTerimi) {
      setAramaSonuclari([])
      setSeciliUrun(null)
      return
    }

    // Eksik ürünlerde ara - tüm eşleşenleri bul
    const eksikBulunanlar = eksikUrunler
      .filter(urun => 
        urun.urunAdi?.toLowerCase().includes(aramaTerimi) ||
        urun.barkod?.toLowerCase().includes(aramaTerimi)
      )
      .map(urun => ({ ...urun, tip: 'eksik' }))

    // Fazla ürünlerde ara - tüm eşleşenleri bul
    const fazlaBulunanlar = fazlaUrunler
      .filter(urun => 
        urun.urunAdi?.toLowerCase().includes(aramaTerimi) ||
        urun.barkod?.toLowerCase().includes(aramaTerimi)
      )
      .map(urun => ({ ...urun, tip: 'fazla' }))

    const tumSonuclar = [...eksikBulunanlar, ...fazlaBulunanlar]

    if (tumSonuclar.length > 0) {
      setAramaSonuclari(tumSonuclar)
      setShowDetailModal(true)
      // Eğer tek sonuç varsa otomatik seç
      if (tumSonuclar.length === 1) {
        setSeciliUrun(tumSonuclar[0])
      } else {
        setSeciliUrun(null)
      }
    } else {
      alert('Ürün bulunamadı!')
      setAramaSonuclari([])
      setSeciliUrun(null)
    }
  }

  const handleUrunSec = (urun) => {
    setSeciliUrun(urun)
  }

  const handleUrunDetayGoster = (urun, tip) => {
    setDetayUrun({ ...urun, tip })
    setShowUrunDetayModal(true)
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">📊 Stok İstatistikleri</h1>
      
      <div className="search-container">
        <form onSubmit={handleArama} className="search-form">
          <input
            type="text"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Barkod numarası veya ürün adı ile ara..."
            className="search-input"
          />
          <button type="submit" className="btn btn-primary search-btn">
            🔍 Ara
          </button>
        </form>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card eksik">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Eksik Ürün Sayısı</h3>
            <p className="stat-value">{toplamEksikUrunSayisi}</p>
          </div>
        </div>
        
        <div className="stat-card eksik">
          <div className="stat-icon">📉</div>
          <div className="stat-content">
            <h3>Toplam Eksik Miktar</h3>
            <p className="stat-value">{toplamEksikMiktar}</p>
          </div>
        </div>
        
        <div className="stat-card fazla">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Fazla Ürün Sayısı</h3>
            <p className="stat-value">{toplamFazlaUrunSayisi}</p>
          </div>
        </div>
        
        <div className="stat-card fazla">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Toplam Fazla Miktar</h3>
            <p className="stat-value">{toplamFazlaMiktar}</p>
          </div>
        </div>
      </div>

      <div className="tables-container">
        <div className="table-section">
          <h2 className="table-title">🔴 En Çok Eksik Olan Ürünler</h2>
          <div className="table-wrapper">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Ürün Adı</th>
                  <th>Kategori</th>
                  <th>Eksik Miktar</th>
                  <th>Barkod</th>
                </tr>
              </thead>
              <tbody>
                {enCokEksikUrunler.length > 0 ? (
                  enCokEksikUrunler.map((urun, index) => (
                    <tr 
                      key={index}
                      className="clickable-row"
                      onClick={() => handleUrunDetayGoster(urun, 'eksik')}
                      title="Detayları görmek için tıklayın"
                    >
                      <td>{urun.urunAdi || 'İsimsiz Ürün'}</td>
                      <td>{urun.kategori || '-'}</td>
                      <td className="eksik-miktar">{urun.miktar || 0}</td>
                      <td>{urun.barkod || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-message">
                      Henüz eksik ürün kaydı yok
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-section">
          <h2 className="table-title">🟢 En Çok Fazla Olan Ürünler</h2>
          <div className="table-wrapper">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Ürün Adı</th>
                  <th>Kategori</th>
                  <th>Fazla Miktar</th>
                  <th>Barkod</th>
                </tr>
              </thead>
              <tbody>
                {enCokFazlaUrunler.length > 0 ? (
                  enCokFazlaUrunler.map((urun, index) => (
                    <tr 
                      key={index}
                      className="clickable-row"
                      onClick={() => handleUrunDetayGoster(urun, 'fazla')}
                      title="Detayları görmek için tıklayın"
                    >
                      <td>{urun.urunAdi || 'İsimsiz Ürün'}</td>
                      <td>{urun.kategori || '-'}</td>
                      <td className="fazla-miktar">{urun.miktar || 0}</td>
                      <td>{urun.barkod || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-message">
                      Henüz fazla ürün kaydı yok
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDetailModal && aramaSonuclari.length > 0 && (
        <div className="modal-overlay" onClick={() => {
          setShowDetailModal(false)
          setSeciliUrun(null)
        }}>
          <div className="modal-content search-results-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔍 Arama Sonuçları ({aramaSonuclari.length})</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowDetailModal(false)
                  setSeciliUrun(null)
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {aramaSonuclari.length === 1 ? (
                // Tek sonuç varsa direkt detay göster
                <div className="detail-section">
                  {aramaSonuclari[0].resim && (
                    <div className="detail-image-container">
                      <img src={aramaSonuclari[0].resim} alt={aramaSonuclari[0].urunAdi} className="detail-image" />
                    </div>
                  )}
                  <div className="detail-info">
                    <div className="detail-row">
                      <span className="detail-label">Ürün Adı:</span>
                      <span className="detail-value detail-value-with-barcode">
                        {aramaSonuclari[0].urunAdi || '-'}
                        {aramaSonuclari[0].barkod && (
                          <BarkodOlusturucu 
                            barkod={aramaSonuclari[0].barkod} 
                            compact={true}
                            showDownloadButton={false}
                          />
                        )}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Kategori:</span>
                      <span className="detail-value">{aramaSonuclari[0].kategori || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Barkod Numarası:</span>
                      <span className="detail-value">{aramaSonuclari[0].barkod || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Tip:</span>
                      <span className={`detail-value ${aramaSonuclari[0].tip === 'eksik' ? 'eksik-badge' : 'fazla-badge'}`}>
                        {aramaSonuclari[0].tip === 'eksik' ? '⚠️ Eksik Ürün' : '📦 Fazla Ürün'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{aramaSonuclari[0].tip === 'eksik' ? 'Eksik Miktar:' : 'Fazla Miktar:'}</span>
                      <span className={`detail-value ${aramaSonuclari[0].tip === 'eksik' ? 'eksik-miktar' : 'fazla-miktar'}`}>
                        {aramaSonuclari[0].miktar || 0}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Tarih:</span>
                      <span className="detail-value">{aramaSonuclari[0].tarih || '-'}</span>
                    </div>
                    {aramaSonuclari[0].aciklama && (
                      <div className="detail-row full-width">
                        <span className="detail-label">Açıklama:</span>
                        <span className="detail-value">{aramaSonuclari[0].aciklama}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Birden fazla sonuç varsa liste göster
                <div className="search-results-container">
                  <div className="search-results-list">
                    {aramaSonuclari.map((urun, index) => (
                      <div 
                        key={index}
                        className={`search-result-item ${seciliUrun === urun ? 'selected' : ''}`}
                        onClick={() => handleUrunSec(urun)}
                      >
                        <div className="result-image">
                          {urun.resim ? (
                            <img src={urun.resim} alt={urun.urunAdi} />
                          ) : (
                            <span className="no-image-small">📷</span>
                          )}
                        </div>
                        <div className="result-info">
                          <h3>{urun.urunAdi || 'İsimsiz Ürün'}</h3>
                          <p><strong>Barkod:</strong> {urun.barkod || '-'}</p>
                          <p><strong>Kategori:</strong> {urun.kategori || '-'}</p>
                          <p>
                            <strong>{urun.tip === 'eksik' ? 'Eksik Miktar:' : 'Fazla Miktar:'}</strong>
                            <span className={urun.tip === 'eksik' ? 'eksik-miktar' : 'fazla-miktar'}>
                              {urun.miktar || 0}
                            </span>
                          </p>
                          <span className={`result-badge ${urun.tip === 'eksik' ? 'eksik-badge' : 'fazla-badge'}`}>
                            {urun.tip === 'eksik' ? '⚠️ Eksik' : '📦 Fazla'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {seciliUrun && (
                    <div className="selected-product-detail">
                      <h3>📦 Seçili Ürün Detayları</h3>
                      <div className="detail-section">
                        {seciliUrun.resim && (
                          <div className="detail-image-container">
                            <img src={seciliUrun.resim} alt={seciliUrun.urunAdi} className="detail-image" />
                          </div>
                        )}
                        <div className="detail-info">
                          <div className="detail-row">
                            <span className="detail-label">Ürün Adı:</span>
                            <span className="detail-value detail-value-with-barcode">
                              {seciliUrun.urunAdi || '-'}
                              {seciliUrun.barkod && (
                                <BarkodOlusturucu 
                                  barkod={seciliUrun.barkod} 
                                  compact={true}
                                  showDownloadButton={false}
                                />
                              )}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Kategori:</span>
                            <span className="detail-value">{seciliUrun.kategori || '-'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Barkod Numarası:</span>
                            <span className="detail-value">{seciliUrun.barkod || '-'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Tip:</span>
                            <span className={`detail-value ${seciliUrun.tip === 'eksik' ? 'eksik-badge' : 'fazla-badge'}`}>
                              {seciliUrun.tip === 'eksik' ? '⚠️ Eksik Ürün' : '📦 Fazla Ürün'}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">{seciliUrun.tip === 'eksik' ? 'Eksik Miktar:' : 'Fazla Miktar:'}</span>
                            <span className={`detail-value ${seciliUrun.tip === 'eksik' ? 'eksik-miktar' : 'fazla-miktar'}`}>
                              {seciliUrun.miktar || 0}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Tarih:</span>
                            <span className="detail-value">{seciliUrun.tarih || '-'}</span>
                          </div>
                          {seciliUrun.aciklama && (
                            <div className="detail-row full-width">
                              <span className="detail-label">Açıklama:</span>
                              <span className="detail-value">{seciliUrun.aciklama}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowDetailModal(false)
                  setSeciliUrun(null)
                }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {showUrunDetayModal && detayUrun && (
        <div className="modal-overlay" onClick={() => {
          setShowUrunDetayModal(false)
          setDetayUrun(null)
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📦 Ürün Detayları</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowUrunDetayModal(false)
                  setDetayUrun(null)
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                {detayUrun.resim && (
                  <div className="detail-image-container">
                    <img src={detayUrun.resim} alt={detayUrun.urunAdi} className="detail-image" />
                  </div>
                )}
                <div className="detail-info">
                  <div className="detail-row">
                    <span className="detail-label">Ürün Adı:</span>
                    <span className="detail-value detail-value-with-barcode">
                      {detayUrun.urunAdi || '-'}
                      {detayUrun.barkod && (
                        <BarkodOlusturucu 
                          barkod={detayUrun.barkod} 
                          compact={true}
                          showDownloadButton={false}
                        />
                      )}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Kategori:</span>
                    <span className="detail-value">{detayUrun.kategori || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Barkod Numarası:</span>
                    <span className="detail-value">{detayUrun.barkod || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tip:</span>
                    <span className={`detail-value ${detayUrun.tip === 'eksik' ? 'eksik-badge' : 'fazla-badge'}`}>
                      {detayUrun.tip === 'eksik' ? '⚠️ Eksik Ürün' : '📦 Fazla Ürün'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{detayUrun.tip === 'eksik' ? 'Eksik Miktar:' : 'Fazla Miktar:'}</span>
                    <span className={`detail-value ${detayUrun.tip === 'eksik' ? 'eksik-miktar' : 'fazla-miktar'}`}>
                      {detayUrun.miktar || 0}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tarih:</span>
                    <span className="detail-value">{detayUrun.tarih || '-'}</span>
                  </div>
                  {detayUrun.aciklama && (
                    <div className="detail-row full-width">
                      <span className="detail-label">Açıklama:</span>
                      <span className="detail-value">{detayUrun.aciklama}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowUrunDetayModal(false)
                  setDetayUrun(null)
                }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

