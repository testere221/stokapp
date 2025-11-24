// Supabase yardımcı fonksiyonları
import { supabase } from '../config/supabase'

const TABLES = {
  EKSIK_URUNLER: 'eksik_urunler',
  FAZLA_URUNLER: 'fazla_urunler'
}

// Veri formatını dönüştür (Supabase'den gelen veriyi uygulama formatına)
const formatUrun = (urun) => ({
  id: urun.id,
  urunAdi: urun.urun_adi,
  kategori: urun.kategori,
  miktar: urun.miktar,
  barkod: urun.barkod,
  resim: urun.resim,
  aciklama: urun.aciklama,
  tarih: urun.tarih
})

// Veri formatını dönüştür (uygulama formatından Supabase formatına)
const formatUrunForDB = (urun) => ({
  urun_adi: urun.urunAdi,
  kategori: urun.kategori || null,
  miktar: parseFloat(urun.miktar) || 0,
  barkod: urun.barkod || null,
  resim: urun.resim || null,
  aciklama: urun.aciklama || null,
  tarih: urun.tarih || new Date().toLocaleDateString('tr-TR')
})

// Eksik Ürünler
export const getEksikUrunler = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.EKSIK_URUNLER)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(formatUrun)
  } catch (error) {
    console.error('Eksik ürünler getirilirken hata:', error)
    return []
  }
}

export const addEksikUrun = async (urun) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.EKSIK_URUNLER)
      .insert([formatUrunForDB(urun)])
      .select()
      .single()

    if (error) throw error
    return formatUrun(data)
  } catch (error) {
    console.error('Eksik ürün eklenirken hata:', error)
    throw error
  }
}

export const updateEksikUrun = async (id, urun) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.EKSIK_URUNLER)
      .update({
        ...formatUrunForDB(urun),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return formatUrun(data)
  } catch (error) {
    console.error('Eksik ürün güncellenirken hata:', error)
    throw error
  }
}

export const deleteEksikUrun = async (id) => {
  try {
    const { error } = await supabase
      .from(TABLES.EKSIK_URUNLER)
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Eksik ürün silinirken hata:', error)
    throw error
  }
}

// Fazla Ürünler
export const getFazlaUrunler = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.FAZLA_URUNLER)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(formatUrun)
  } catch (error) {
    console.error('Fazla ürünler getirilirken hata:', error)
    return []
  }
}

export const addFazlaUrun = async (urun) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.FAZLA_URUNLER)
      .insert([formatUrunForDB(urun)])
      .select()
      .single()

    if (error) throw error
    return formatUrun(data)
  } catch (error) {
    console.error('Fazla ürün eklenirken hata:', error)
    throw error
  }
}

export const updateFazlaUrun = async (id, urun) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.FAZLA_URUNLER)
      .update({
        ...formatUrunForDB(urun),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return formatUrun(data)
  } catch (error) {
    console.error('Fazla ürün güncellenirken hata:', error)
    throw error
  }
}

export const deleteFazlaUrun = async (id) => {
  try {
    const { error } = await supabase
      .from(TABLES.FAZLA_URUNLER)
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Fazla ürün silinirken hata:', error)
    throw error
  }
}

// Gerçek zamanlı listener'lar
export const subscribeEksikUrunler = (callback) => {
  const channel = supabase
    .channel('eksik-urunler-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.EKSIK_URUNLER
      },
      async () => {
        const urunler = await getEksikUrunler()
        callback(urunler)
      }
    )
    .subscribe()

  // İlk veriyi yükle
  getEksikUrunler().then(callback)

  return () => {
    supabase.removeChannel(channel)
  }
}

export const subscribeFazlaUrunler = (callback) => {
  const channel = supabase
    .channel('fazla-urunler-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.FAZLA_URUNLER
      },
      async () => {
        const urunler = await getFazlaUrunler()
        callback(urunler)
      }
    )
    .subscribe()

  // İlk veriyi yükle
  getFazlaUrunler().then(callback)

  return () => {
    supabase.removeChannel(channel)
  }
}

