import { useState, useEffect } from 'react'
import { getFazlaUrunler, saveFazlaUrunler } from '../utils/storage'
import './Urunler.css'

function FazlaUrunler() {
  const [urunler, setUrunler] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [formData, setFormData] = useState({
    urunAdi: '',
    kategori: '',
    miktar: '',
    barkod: '',
    resim: '',
    aciklama: ''
  })

  useEffect(() => {
    loadUrunler()
  }, [])

  const loadUrunler = () => {
    setUrunler(getFazlaUrunler())
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          resim: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      resim: ''
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const yeniUrun = {
      ...formData,
      miktar: parseFloat(formData.miktar) || 0,
      tarih: new Date().toLocaleDateString('tr-TR')
    }

    const yeniListe = [...urunler]
    
    if (editingIndex !== null) {
      yeniListe[editingIndex] = yeniUrun
    } else {
      yeniListe.push(yeniUrun)
    }

    saveFazlaUrunler(yeniListe)
    setUrunler(yeniListe)
    resetForm()
  }

  const handleEdit = (index) => {
    setEditingIndex(index)
    setFormData(urunler[index])
    setShowForm(true)
  }

  const handleDelete = (index) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      const yeniListe = urunler.filter((_, i) => i !== index)
      saveFazlaUrunler(yeniListe)
      setUrunler(yeniListe)
    }
  }

  const resetForm = () => {
    setFormData({
      urunAdi: '',
      kategori: '',
      miktar: '',
      barkod: '',
      resim: '',
      aciklama: ''
    })
    setShowForm(false)
    setEditingIndex(null)
  }

  return (
    <div className="urunler-page">
      <div className="page-header">
        <h1 className="page-title">📦 Fazla Ürünler</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '❌ İptal' : '➕ Yeni Ürün Ekle'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="urun-form">
            <h2>{editingIndex !== null ? '✏️ Ürün Düzenle' : '➕ Yeni Ürün Ekle'}</h2>
            
            <div className="form-group">
              <label>Ürün Adı *</label>
              <input
                type="text"
                name="urunAdi"
                value={formData.urunAdi}
                onChange={handleInputChange}
                required
                placeholder="Örn: Laptop"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Kategori</label>
                <input
                  type="text"
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleInputChange}
                  placeholder="Örn: Elektronik"
                />
              </div>

              <div className="form-group">
                <label>Fazla Miktar *</label>
                <input
                  type="number"
                  name="miktar"
                  value={formData.miktar}
                  onChange={handleInputChange}
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
                  value={formData.barkod}
                  onChange={handleInputChange}
                  placeholder="Örn: 1234567890123"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Ürün Resmi</label>
              {formData.resim ? (
                <div className="image-preview-container">
                  <img src={formData.resim} alt="Ürün resmi" className="image-preview" />
                  <button type="button" onClick={removeImage} className="btn btn-secondary btn-small">
                    🗑️ Resmi Kaldır
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
              )}
            </div>

            <div className="form-group">
              <label>Açıklama</label>
              <textarea
                name="aciklama"
                value={formData.aciklama}
                onChange={handleInputChange}
                rows="3"
                placeholder="Ek bilgiler..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingIndex !== null ? '💾 Kaydet' : '➕ Ekle'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h2>Ürün Listesi ({urunler.length})</h2>
        </div>
        
        {urunler.length > 0 ? (
          <div className="table-wrapper">
            <table className="urun-table">
              <thead>
                <tr>
                  <th>Resim</th>
                  <th>Ürün Adı</th>
                  <th>Kategori</th>
                  <th>Fazla Miktar</th>
                  <th>Barkod</th>
                  <th>Tarih</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {urunler.map((urun, index) => (
                  <tr key={index}>
                    <td>
                      {urun.resim ? (
                        <img src={urun.resim} alt={urun.urunAdi} className="table-image" />
                      ) : (
                        <span className="no-image">📷</span>
                      )}
                    </td>
                    <td>{urun.urunAdi}</td>
                    <td>{urun.kategori || '-'}</td>
                    <td className="fazla-miktar">{urun.miktar}</td>
                    <td>{urun.barkod || '-'}</td>
                    <td>{urun.tarih || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(index)}
                          className="btn-icon btn-edit"
                          title="Düzenle"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="btn-icon btn-delete"
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>📭 Henüz fazla ürün kaydı yok</p>
            <p className="empty-hint">Yeni ürün eklemek için yukarıdaki butona tıklayın</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FazlaUrunler

