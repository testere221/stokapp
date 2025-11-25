import { useEffect, useState } from 'react'
import { 
  subscribeEksikUrunler, 
  subscribeFazlaUrunler,
  updateEksikUrun,
  updateFazlaUrun,
  deleteEksikUrun,
  deleteFazlaUrun,
  addEksikUrun,
  addFazlaUrun
} from '../utils/supabase-storage'
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
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImage, setModalImage] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUrun, setEditingUrun] = useState(null)
  const [editFormData, setEditFormData] = useState({
    urunAdi: '',
    miktar: '',
    barkod: '',
    resim: '',
    aciklama: ''
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('fazla') // 'eksik' veya 'fazla'
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalType, setAddModalType] = useState(null) // 'eksik' veya 'fazla'
  const [addFormData, setAddFormData] = useState({
    urunAdi: '',
    miktar: '',
    barkod: '',
    resim: '',
    aciklama: ''
  })
  const [addLoading, setAddLoading] = useState(false)
  const [showContinuousFlow, setShowContinuousFlow] = useState(false)

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

  const handleEdit = (urun, tip) => {
    setEditingUrun({ ...urun, tip })
      setEditFormData({
        urunAdi: urun.urunAdi || '',
        miktar: urun.miktar || '',
        barkod: urun.barkod || '',
        resim: urun.resim || '',
        aciklama: urun.aciklama || ''
      })
    setShowEditModal(true)
  }

  const handleDelete = async (urun, tip) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        if (tip === 'eksik') {
          await deleteEksikUrun(urun.id)
        } else {
          await deleteFazlaUrun(urun.id)
        }
      } catch (error) {
        console.error('Hata:', error)
        alert('Silme işlemi başarısız oldu.')
      }
    }
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEditImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditFormData(prev => ({
          ...prev,
          resim: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeEditImage = () => {
    setEditFormData(prev => ({
      ...prev,
      resim: ''
    }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const guncellenmisUrun = {
        ...editFormData,
        miktar: parseFloat(editFormData.miktar) || 0,
        tarih: new Date().toLocaleDateString('tr-TR')
      }

      if (editingUrun.tip === 'eksik') {
        await updateEksikUrun(editingUrun.id, guncellenmisUrun)
      } else {
        await updateFazlaUrun(editingUrun.id, guncellenmisUrun)
      }
      
      setShowEditModal(false)
      setEditingUrun(null)
      setEditFormData({
        urunAdi: '',
        miktar: '',
        barkod: '',
        resim: '',
        aciklama: ''
      })
    } catch (error) {
      console.error('Hata:', error)
      alert('Güncelleme işlemi başarısız oldu.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddInputChange = (e) => {
    const { name, value } = e.target
    setAddFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAddFormData(prev => ({
          ...prev,
          resim: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAddImage = () => {
    setAddFormData(prev => ({
      ...prev,
      resim: ''
    }))
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    setAddLoading(true)
    
    try {
      const yeniUrun = {
        ...addFormData,
        miktar: parseFloat(addFormData.miktar) || 0,
        tarih: new Date().toLocaleDateString('tr-TR')
      }

      if (addModalType === 'eksik') {
        await addEksikUrun(yeniUrun)
      } else {
        await addFazlaUrun(yeniUrun)
      }
      
      setShowAddModal(false)
      setAddModalType(null)
      setAddFormData({
        urunAdi: '',
        miktar: '',
        barkod: '',
        resim: '',
        aciklama: ''
      })
    } catch (error) {
      console.error('Hata:', error)
      alert('Ürün ekleme işlemi başarısız oldu.')
    } finally {
      setAddLoading(false)
    }
  }

  const openAddModal = (type) => {
    setAddModalType(type)
    setShowAddModal(true)
  }

  const playSound = () => {
    const audio = new Audio('/sound.mp3')
    
    // Ses bitince animasyonu durdur
    audio.addEventListener('ended', () => {
      setShowContinuousFlow(false)
    })
    
    // Ses çalarken animasyonu başlat
    audio.play().then(() => {
      // Konfeti patlaması efekti
      setShowContinuousFlow(true)
    }).catch(err => {
      console.error('Ses çalınamadı:', err)
    })
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="nav-logo">📦 Stok Kontrol</h1>
          <div className="nav-actions">
            <button 
              className="btn btn-sound"
              onClick={playSound}
              title="Ses Çal"
            >
              🔊
            </button>
            <div className="add-buttons">
              <button 
                className="btn btn-danger"
                onClick={() => openAddModal('eksik')}
              >
                ⚠️ Eksik Ürün Ekle
              </button>
              <button 
                className="btn btn-success"
                onClick={() => openAddModal('fazla')}
              >
                📦 Fazla Ürün Ekle
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="search-wrapper">
          <form onSubmit={handleArama} className="search-form-new">
            <div className="search-input-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                value={arama}
                onChange={(e) => setArama(e.target.value)}
                placeholder="Barkod veya ürün adı ile ara..."
                className="search-input-new"
              />
              {arama && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setArama('')}
                  title="Temizle"
                >
                  ✕
                </button>
              )}
            </div>
            {arama && (
              <button type="submit" className="search-submit-btn">
                Ara
              </button>
            )}
          </form>
        </div>
      
      {/* İstatistikler - Tek Kart */}
      <div className="stats-card-compact">
        <div className="stats-compact-grid">
          <div className="stat-item-compact">
            <span className="stat-icon-compact">⚠️</span>
            <div className="stat-info-compact">
              <span className="stat-label-compact">Eksik Ürün</span>
              <span className="stat-value-compact">{toplamEksikUrunSayisi}</span>
            </div>
          </div>
          <div className="stat-item-compact">
            <span className="stat-icon-compact">📉</span>
            <div className="stat-info-compact">
              <span className="stat-label-compact">Eksik Miktar</span>
              <span className="stat-value-compact">{toplamEksikMiktar}</span>
            </div>
          </div>
          <div className="stat-item-compact">
            <span className="stat-icon-compact">📦</span>
            <div className="stat-info-compact">
              <span className="stat-label-compact">Fazla Ürün</span>
              <span className="stat-value-compact">{toplamFazlaUrunSayisi}</span>
            </div>
          </div>
          <div className="stat-item-compact">
            <span className="stat-icon-compact">📈</span>
            <div className="stat-info-compact">
              <span className="stat-label-compact">Fazla Miktar</span>
              <span className="stat-value-compact">{toplamFazlaMiktar}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sekmeli Ürün Listesi */}
      <div className="tabs-container">
        <div className="tabs-header">
          <button
            className={`tab-button ${activeTab === 'fazla' ? 'active' : ''}`}
            onClick={() => setActiveTab('fazla')}
          >
            📦 Fazla Ürünler ({fazlaUrunler.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'eksik' ? 'active' : ''}`}
            onClick={() => setActiveTab('eksik')}
          >
            ⚠️ Eksik Ürünler ({eksikUrunler.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'fazla' && (
            <div className="table-section">
              <div className="table-wrapper">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th className="table-image-header">Resim</th>
                      <th>Ürün Adı</th>
                      <th>Fazla Miktar</th>
                      <th>Barkod</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fazlaUrunler.length > 0 ? (
                      fazlaUrunler
                        .sort((a, b) => (b.miktar || 0) - (a.miktar || 0))
                        .map((urun) => (
                          <tr 
                            key={urun.id}
                            className="clickable-row"
                            onClick={() => handleUrunDetayGoster(urun, 'fazla')}
                            title="Detayları görmek için tıklayın"
                          >
                            <td className="table-image-cell" onClick={(e) => e.stopPropagation()}>
                              {urun.resim ? (
                                <img
                                  src={urun.resim}
                                  alt={urun.urunAdi || 'Ürün resmi'}
                                  className="table-product-image"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setModalImage(urun.resim)
                                    setShowImageModal(true)
                                  }}
                                  title="Tam boyut görmek için tıklayın"
                                />
                              ) : (
                                <div className="table-image-placeholder">📷</div>
                              )}
                            </td>
                            <td>{urun.urunAdi || 'İsimsiz Ürün'}</td>
                            <td className="fazla-miktar">{urun.miktar || 0}</td>
                            <td>{urun.barkod || '-'}</td>
                            <td className="action-cell" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="btn-icon btn-edit"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEdit(urun, 'fazla')
                                }}
                                title="Düzenle"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-icon btn-delete"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(urun, 'fazla')
                                }}
                                title="Sil"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="empty-message">
                          Henüz fazla ürün kaydı yok
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'eksik' && (
            <div className="table-section">
              <div className="table-wrapper">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th className="table-image-header">Resim</th>
                      <th>Ürün Adı</th>
                      <th>Eksik Miktar</th>
                      <th>Barkod</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eksikUrunler.length > 0 ? (
                      eksikUrunler
                        .sort((a, b) => (b.miktar || 0) - (a.miktar || 0))
                        .map((urun) => (
                          <tr 
                            key={urun.id}
                            className="clickable-row"
                            onClick={() => handleUrunDetayGoster(urun, 'eksik')}
                            title="Detayları görmek için tıklayın"
                          >
                            <td className="table-image-cell" onClick={(e) => e.stopPropagation()}>
                              {urun.resim ? (
                                <img
                                  src={urun.resim}
                                  alt={urun.urunAdi || 'Ürün resmi'}
                                  className="table-product-image"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setModalImage(urun.resim)
                                    setShowImageModal(true)
                                  }}
                                  title="Tam boyut görmek için tıklayın"
                                />
                              ) : (
                                <div className="table-image-placeholder">📷</div>
                              )}
                            </td>
                            <td>{urun.urunAdi || 'İsimsiz Ürün'}</td>
                            <td className="eksik-miktar">{urun.miktar || 0}</td>
                            <td>{urun.barkod || '-'}</td>
                            <td className="action-cell" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="btn-icon btn-edit"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEdit(urun, 'eksik')
                                }}
                                title="Düzenle"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-icon btn-delete"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(urun, 'eksik')
                                }}
                                title="Sil"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="empty-message">
                          Henüz eksik ürün kaydı yok
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
                        {/* Barkod Resmi - Yukarıda */}
                        {seciliUrun.barkod && (
                          <div 
                            className="detail-barcode-container clickable-image"
                            onClick={(e) => {
                              // Barkod canvas'ını bul
                              const container = e.currentTarget
                              const canvas = container.querySelector('canvas')
                              if (canvas) {
                                const dataUrl = canvas.toDataURL('image/png')
                                setModalImage(dataUrl)
                                setShowImageModal(true)
                              }
                            }}
                            title="Tam boyut görmek için tıklayın"
                          >
                            <BarkodOlusturucu 
                              barkod={seciliUrun.barkod} 
                              compact={false}
                              showDownloadButton={false}
                            />
                          </div>
                        )}
                        
                        {/* Detay Bilgileri */}
                        <div className="detail-info">
                          <div className="detail-row">
                            <span className="detail-label">Ürün Adı:</span>
                            <span className="detail-value">
                              {seciliUrun.urunAdi || '-'}
                            </span>
                          </div>
                          <div className="detail-row">
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

                        {/* Ürün Resmi - Aşağıda */}
                        {seciliUrun.resim && (
                          <div 
                            className="detail-image-container clickable-image"
                            onClick={() => {
                              setModalImage(seciliUrun.resim)
                              setShowImageModal(true)
                            }}
                            title="Tam boyut görmek için tıklayın"
                          >
                            <img src={seciliUrun.resim} alt={seciliUrun.urunAdi} className="detail-image" />
                          </div>
                        )}
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
          <div className="modal-content product-detail-modal" onClick={(e) => e.stopPropagation()}>
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
              <div className="product-detail-new">
                {/* Ürün Adı ve Resmi */}
                <div className="product-header-new">
                  <div className="product-name-section">
                    <span className="product-label">Ürün:</span>
                    <span className="product-name-value">{detayUrun.urunAdi || '-'}</span>
                  </div>
                  {detayUrun.resim && (
                    <div 
                      className="product-image-small"
                      onClick={() => {
                        setModalImage(detayUrun.resim)
                        setShowImageModal(true)
                      }}
                      title="Tam boyut görmek için tıklayın"
                    >
                      <img src={detayUrun.resim} alt={detayUrun.urunAdi} />
                    </div>
                  )}
                </div>

                {/* Barkod Kartı */}
                {detayUrun.barkod && (
                  <div className="barkod-card">
                    <div className="barkod-card-label">Barkod:</div>
                    <div className="barkod-card-content">
                      <BarkodOlusturucu 
                        barkod={detayUrun.barkod} 
                        urunAdi=""
                        compact={false}
                        showDownloadButton={false}
                      />
                    </div>
                  </div>
                )}

                {/* Ürün Durumu */}
                <div className="product-status-card">
                  <div className="product-status-label">Ürün Durumu:</div>
                  <div className="product-status-content">
                    <span className={`status-badge ${detayUrun.tip === 'eksik' ? 'eksik-badge' : 'fazla-badge'}`}>
                      {detayUrun.tip === 'eksik' ? '⚠️ Eksik' : '📦 Fazla'}
                    </span>
                    <span className={`status-amount ${detayUrun.tip === 'eksik' ? 'eksik-miktar' : 'fazla-miktar'}`}>
                      {detayUrun.miktar || 0}
                    </span>
                  </div>
                </div>

                {/* Tarih */}
                <div className="product-date-card">
                  <div className="product-date-label">Tarih:</div>
                  <div className="product-date-value">{detayUrun.tarih || '-'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ürün Resmi Tam Boyut Modal */}
      {showImageModal && modalImage && (
        <div className="modal-overlay" onClick={() => {
          setShowImageModal(false)
          setModalImage(null)
        }}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => {
                setShowImageModal(false)
                setModalImage(null)
              }}
            >
              ✕
            </button>
            <img src={modalImage} alt="Ürün resmi" className="full-size-image" />
          </div>
        </div>
      )}

      {/* Düzenleme Modal */}
      {showEditModal && editingUrun && (
        <div className="modal-overlay" onClick={() => {
          setShowEditModal(false)
          setEditingUrun(null)
        }}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Ürün Düzenle</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingUrun(null)
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditSubmit} className="edit-form minimal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Ürün Adı *</label>
                    <input
                      type="text"
                      name="urunAdi"
                      value={editFormData.urunAdi}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Örn: Laptop"
                    />
                  </div>

                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{editingUrun.tip === 'eksik' ? 'Eksik Miktar *' : 'Fazla Miktar *'}</label>
                    <input
                      type="number"
                      name="miktar"
                      value={editFormData.miktar}
                      onChange={handleEditInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Barkod Numarası</label>
                    <input
                      type="text"
                      name="barkod"
                      value={editFormData.barkod}
                      onChange={handleEditInputChange}
                      placeholder="Örn: 1234567890123"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Ürün Resmi</label>
                  {editFormData.resim ? (
                    <div className="image-preview-container">
                      <img src={editFormData.resim} alt="Ürün resmi" className="image-preview" />
                      <button type="button" onClick={removeEditImage} className="btn btn-secondary btn-small">
                        🗑️ Resmi Kaldır
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="file-input"
                    />
                  )}
                </div>

                <div className="form-group">
                  <label>Açıklama</label>
                  <textarea
                    name="aciklama"
                    value={editFormData.aciklama}
                    onChange={handleEditInputChange}
                    rows="3"
                    placeholder="Ürün hakkında notlar..."
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingUrun(null)
                    }}
                    disabled={loading}
                  >
                    İptal
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Ürün Ekleme Modal */}
      {showAddModal && addModalType && (
        <div className="modal-overlay" onClick={() => {
          setShowAddModal(false)
          setAddModalType(null)
          setAddFormData({
            urunAdi: '',
            kategori: '',
            miktar: '',
            barkod: '',
            resim: '',
            aciklama: ''
          })
        }}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{addModalType === 'eksik' ? '⚠️ Eksik Ürün Ekle' : '📦 Fazla Ürün Ekle'}</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowAddModal(false)
                  setAddModalType(null)
                  setAddFormData({
                    urunAdi: '',
                    kategori: '',
                    miktar: '',
                    barkod: '',
                    resim: '',
                    aciklama: ''
                  })
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddSubmit} className="edit-form minimal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Ürün Adı *</label>
                    <input
                      type="text"
                      name="urunAdi"
                      value={addFormData.urunAdi}
                      onChange={handleAddInputChange}
                      required
                      placeholder="Örn: Laptop"
                    />
                  </div>

                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{addModalType === 'eksik' ? 'Eksik Miktar *' : 'Fazla Miktar *'}</label>
                    <input
                      type="number"
                      name="miktar"
                      value={addFormData.miktar}
                      onChange={handleAddInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Barkod Numarası</label>
                    <input
                      type="text"
                      name="barkod"
                      value={addFormData.barkod}
                      onChange={handleAddInputChange}
                      placeholder="Örn: 1234567890123"
                    />
                    {addFormData.barkod && (
                      <div className="barkod-preview-container">
                        <BarkodOlusturucu 
                          barkod={addFormData.barkod} 
                          urunAdi={addFormData.urunAdi || ''}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Ürün Resmi</label>
                  {addFormData.resim ? (
                    <div className="image-preview-container">
                      <img src={addFormData.resim} alt="Ürün resmi" className="image-preview" />
                      <button type="button" onClick={removeAddImage} className="btn btn-secondary btn-small">
                        🗑️ Resmi Kaldır
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAddImageChange}
                      className="file-input"
                    />
                  )}
                </div>

                <div className="form-group">
                  <label>Açıklama</label>
                  <textarea
                    name="aciklama"
                    value={addFormData.aciklama}
                    onChange={handleAddInputChange}
                    rows="3"
                    placeholder="Ürün hakkında notlar..."
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddModal(false)
                      setAddModalType(null)
                      setAddFormData({
                        urunAdi: '',
                        kategori: '',
                        miktar: '',
                        barkod: '',
                        resim: '',
                        aciklama: ''
                      })
                    }}
                    disabled={addLoading}
                  >
                    İptal
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={addLoading}
                  >
                    {addLoading ? '⏳ Ekleniyor...' : '➕ Ekle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Konfeti Patlaması Efekti */}
      {showContinuousFlow && (
        <div className="confetti-explosion-container">
          {Array.from({ length: 100 }).map((_, index) => {
            const randomSize = 30 + Math.random() * 50; // 30-80px arası
            const randomAngle = (Math.PI * 2 / 100) * index + (Math.random() - 0.5) * 0.3; // Her yöne dağıl (radyan)
            const randomDistance = 200 + Math.random() * 300; // 200-500px mesafe
            const randomDuration = 1.5 + Math.random() * 1.5; // 1.5-3 saniye
            const randomDelay = Math.random() * 0.3; // 0-0.3 saniye gecikme
            const randomRotation = Math.random() * 720; // 0-720 derece dönüş
            const isHeart = Math.random() < 0.3; // %30 ihtimalle kalp
            
            // Trigonometrik hesaplamalar
            const endX = Math.cos(randomAngle) * randomDistance;
            const endY = Math.sin(randomAngle) * randomDistance;
            const midX = Math.cos(randomAngle) * randomDistance * 0.5;
            const midY = Math.sin(randomAngle) * randomDistance * 0.5;
            
            return (
              isHeart ? (
                <div
                  key={`explosion-heart-${index}`}
                  className="explosion-item explosion-heart"
                  style={{
                    fontSize: `${randomSize}px`,
                    animationDelay: `${randomDelay}s`,
                    animationDuration: `${randomDuration}s`,
                    '--end-x': `${endX}px`,
                    '--end-y': `${endY}px`,
                    '--mid-x': `${midX}px`,
                    '--mid-y': `${midY}px`,
                    '--rotation': `${randomRotation}deg`
                  }}
                >
                  ❤️
                </div>
              ) : (
                <img
                  key={`explosion-${index}`}
                  src="/confetti-image.png"
                  alt=""
                  className="explosion-item"
                  style={{
                    width: `${randomSize}px`,
                    height: `${randomSize}px`,
                    animationDelay: `${randomDelay}s`,
                    animationDuration: `${randomDuration}s`,
                    '--end-x': `${endX}px`,
                    '--end-y': `${endY}px`,
                    '--mid-x': `${midX}px`,
                    '--mid-y': `${midY}px`,
                    '--rotation': `${randomRotation}deg`
                  }}
                />
              )
            )
          })}
        </div>
      )}
      </main>
    </div>
  )
}

export default Dashboard

