import { delay } from '../utils/formatters';

// AI Service - Currently returns mock/demo results
// In production: Connect to Cloud Functions / AI API endpoints

export const aiService = {
  /**
   * Analyze product image and return AI detection results
   * In Firebase: Call Cloud Function that uses Vision AI
   */
  analyzeProduct: async (imageData) => {
    await delay(2000); // Simulate AI processing time
    
    // Demo AI analysis result
    const categories = ['Vazo', 'Halı', 'Seramik', 'Çömlek', 'Testi', 'Tabak'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    const results = {
      'Vazo': {
        category: 'Vazo',
        confidence: 0.94,
        suggestedName: 'Kapadokya El Yapımı Kırmızı Kil Vazo',
        suggestedDescription: 'Avanos\'un geleneksel çömlekçilik tekniğiyle, Kızılırmak kilinden üretilmiş el yapımı vazo. Doğal mineral pigmentlerle renklendirilmiştir.',
        suggestedMaterials: 'Kızılırmak kırmızı kili, doğal mineral pigmentler',
        suggestedTechnique: 'Geleneksel çömlekçi çarkı, el şekillendirme, 1050°C fırınlama',
        suggestedCulturalStory: 'Bu vazo, 3000 yıllık Avanos çömlekçilik geleneğinin yaşayan bir örneğidir. Kızılırmak nehrinin kıyılarından toplanan kırmızı kil, ustanın elinde benzersiz bir forma kavuşur.'
      },
      'Halı': {
        category: 'Halı',
        confidence: 0.91,
        suggestedName: 'Kapadokya Geleneksel El Dokuma Halı',
        suggestedDescription: 'Doğal boyalarla renklendirilmiş yünlerden, geleneksel Anadolu motifleriyle dokunmuş otantik halı.',
        suggestedMaterials: 'Doğal yün, bitkisel boyalar (ceviz kabuğu, nar kabuğu)',
        suggestedTechnique: 'El dokuma, Gördes düğümü, doğal boyama',
        suggestedCulturalStory: 'Kapadokya halıları, Türk halıcılık sanatının en nadide örneklerindendir. Her motif doğadan ve günlük yaşamdan ilham alır.'
      },
      'Seramik': {
        category: 'Seramik',
        confidence: 0.89,
        suggestedName: 'Göreme El Boyama Seramik',
        suggestedDescription: 'Hitit ve Osmanlı motiflerinden ilham alan, el boyama tekniğiyle süslenmiş dekoratif seramik.',
        suggestedMaterials: 'Beyaz kil, sır, mineral pigmentler',
        suggestedTechnique: 'El boyama, çift fırınlama, sırlama tekniği',
        suggestedCulturalStory: 'Göreme seramikleri, bölgenin volkanik topraklarının sunduğu eşsiz hammaddelerle üretilir.'
      },
      'Çömlek': {
        category: 'Çömlek',
        confidence: 0.92,
        suggestedName: 'Kapadokya Geleneksel Çömlek',
        suggestedDescription: 'Volkanik topraklardan elde edilen kil ile şekillendirilen geleneksel Kapadokya çömleği.',
        suggestedMaterials: 'Yerel kırmızı kil, doğal sır',
        suggestedTechnique: 'Çömlekçi çarkı, geleneksel fırınlama',
        suggestedCulturalStory: 'Kapadokya çömlekleri, yüzyıllardır bölge mutfağının ayrılmaz bir parçasıdır.'
      },
      'Testi': {
        category: 'Testi',
        confidence: 0.88,
        suggestedName: 'Anadolu Geleneksel El Yapımı Testi',
        suggestedDescription: 'Gözenekli kırmızı kilden üretilmiş, suyu doğal serin tutan geleneksel testi.',
        suggestedMaterials: 'Gözenekli kırmızı kil, doğal pigmentler',
        suggestedTechnique: 'Geleneksel el şekillendirme, açık hava kurutma',
        suggestedCulturalStory: 'Anadolu\'da testiler, yaşamın sembolüdür. Su taşıyan testi, bereketin ve misafirperverliğin simgesidir.'
      },
      'Tabak': {
        category: 'Tabak',
        confidence: 0.90,
        suggestedName: 'Kapadokya El İşi Dekoratif Tabak',
        suggestedDescription: 'İznik çini geleneğinden ilham alan, el boyama dekoratif tabak.',
        suggestedMaterials: 'Beyaz kil, kobalt oksit, turkuaz pigment',
        suggestedTechnique: 'El boyama, İznik sırlama tekniği, çift fırınlama',
        suggestedCulturalStory: 'İznik çini sanatı, Osmanlı İmparatorluğu\'nun en değerli sanat formlarından biridir.'
      }
    };

    return results[randomCategory] || results['Vazo'];
  },

  /**
   * Generate advertisement text for a product
   * In Firebase: Call Cloud Function with AI text generation
   */
  generateAdText: async (productName, category, description) => {
    await delay(1500);
    
    return {
      adText: `${productName} — Kapadokya'nın kalbinden gelen eşsiz bir el sanatı eseri! ${category} kategorisinde, geleneksel tekniklerle üretilmiş bu benzersiz parça, evinize Anadolu'nun sıcaklığını taşıyor. Şimdi keşfedin!`,
      productIntroText: `${description} Her biri usta ellerin benzersiz dokunuşunu taşıyan bu eser, Kapadokya'nın binlerce yıllık kültürel mirasının modern bir yorumudur. Doğal malzemeler ve geleneksel tekniklerle üretilen bu ${category.toLowerCase()}, hem estetik hem de kültürel değer taşımaktadır.`,
      voiceAdText: `Kapadokya'nın büyülü topraklarından, usta ellerin dokunuşuyla hayat bulan bir başyapıt. ${productName}, binlerce yıllık Anadolu geleneğini modern yaşamınıza taşıyor. Doğal malzemeler, geleneksel teknikler ve eşsiz bir hikaye. Şimdi bu benzersiz eseri keşfedin ve tarihe dokunun.`
    };
  },

  /**
   * AI Video generation - placeholder
   * In Firebase: Call Cloud Function / external AI video API
   */
  generateVideo: async (productId) => {
    await delay(500);
    return {
      success: false,
      message: 'AI video oluşturma özelliği yakında aktif edilecektir.'
    };
  }
};
