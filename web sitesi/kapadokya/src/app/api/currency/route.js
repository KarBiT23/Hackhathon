import { NextResponse } from 'next/server';

const SERIES_MAP = {
  USD: 'TP.DK.USD.S.YTL',
  EUR: 'TP.DK.EUR.S.YTL',
  GBP: 'TP.DK.GBP.S.YTL'
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get('currency');

  if (!currency || !SERIES_MAP[currency]) {
    return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
  }

  const seriesCode = SERIES_MAP[currency];
  const apiKey = process.env.EVDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'EVDS_API_KEY not configured' }, { status: 500 });
  }

  // Get date range: today and 5 days ago (to account for weekends/holidays)
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 5);
  
  const formatDate = (date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const startDate = formatDate(pastDate);
  const endDate = formatDate(today);

  try {
    const url = `https://evds2.tcmb.gov.tr/service/evds/series=${seriesCode}&startDate=${startDate}&endDate=${endDate}&type=json`;
    const response = await fetch(url, {
      headers: {
        'key': apiKey
      },
      next: { revalidate: 3600 } // cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`EVDS API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Find the latest valid rate (searching backwards from items array)
    let rate = null;
    let lastUpdated = null;
    
    if (data.items && data.items.length > 0) {
      for (let i = data.items.length - 1; i >= 0; i--) {
        const item = data.items[i];
        if (item[seriesCode.replace(/\./g, '_')] !== null) {
          rate = parseFloat(item[seriesCode.replace(/\./g, '_')]);
          lastUpdated = item.Tarih;
          break;
        }
      }
    }

    if (rate) {
      return NextResponse.json({
        currency,
        rate,
        source: 'TCMB EVDS',
        seriesCode,
        lastUpdated,
        isDemo: false
      });
    } else {
      throw new Error('No rate data found in EVDS response');
    }
  } catch (error) {
    console.error('EVDS API Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
