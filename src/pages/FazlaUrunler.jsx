import { useState, useEffect } from 'react'
import { 
  subscribeFazlaUrunler, 
  addFazlaUrun, 
  updateFazlaUrun, 
  deleteFazlaUrun 
} from '../utils/supabase-storage'
import './Urunler.css'

function FazlaUrunler() {
  const [urunler, setUrunler] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    urunAdi: '',
    kategori: '',
    miktar: '',
    barkod: '',
    resim: '',
    aciklama: ''
  })

  useEffect(() => {
    // Gerçek zamanlı dinleme
    const unsubscribe = subscribeFazlaUrunler((urunler) => {
      setUrunler(urunler)
    })

    return () => unsubscribe()
  }, [])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const yeniUrun = {
        ...formData,
        miktar: parseFloat(formData.miktar) || 0,
        tarih: new Date().toLocaleDateString('tr-TR')
      }

      if (editingId) {
        await updateFazlaUrun(editingId, yeniUrun)
      } else {
        await addFazlaUrun(yeniUrun)
      }
      
      resetForm()
    } catch (error) {
      console.error('Hata:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (urun) => {
    setEditingId(urun.id)
    setFormData({
      urunAdi: urun.urunAdi || '',
      kategori: urun.kategori || '',
      miktar: urun.miktar || '',
      barkod: urun.barkod || '',
      resim: urun.resim || '',
      aciklama: urun.aciklama || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        await deleteFazlaUrun(id)
      } catch (error) {
        console.error('Hata:', error)
        alert('Silme işlemi başarısız oldu.')
      }
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
    setEditingId(null)
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
            <h2>{editingId ? '✏️ Ürün Düzenle' : '➕ Yeni Ürün Ekle'}</h2>
            
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
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? '⏳ Kaydediliyor...' : (editingId ? '💾 Kaydet' : '➕ Ekle')}
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
                {urunler.map((urun) => (
                  <tr key={urun.id}>
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
                          onClick={() => handleEdit(urun)}
                          className="btn-icon btn-edit"
                          title="Düzenle"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(urun.id)}
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
