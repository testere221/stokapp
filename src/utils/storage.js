// LocalStorage yardımcı fonksiyonları

export const STORAGE_KEYS = {
  EKSIK_URUNLER: 'eksik_urunler',
  FAZLA_URUNLER: 'fazla_urunler'
}

export const getEksikUrunler = () => {
  const data = localStorage.getItem(STORAGE_KEYS.EKSIK_URUNLER)
  return data ? JSON.parse(data) : []
}

export const saveEksikUrunler = (urunler) => {
  localStorage.setItem(STORAGE_KEYS.EKSIK_URUNLER, JSON.stringify(urunler))
}

export const getFazlaUrunler = () => {
  const data = localStorage.getItem(STORAGE_KEYS.FAZLA_URUNLER)
  return data ? JSON.parse(data) : []
}

export const saveFazlaUrunler = (urunler) => {
  localStorage.setItem(STORAGE_KEYS.FAZLA_URUNLER, JSON.stringify(urunler))
}

