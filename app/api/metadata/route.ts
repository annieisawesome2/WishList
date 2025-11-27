import { NextRequest, NextResponse } from 'next/server'
import { extractPriceFromText } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch URL')
    }

    const html = await response.text()
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : undefined

    // Extract Open Graph image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    const thumbnail = ogImageMatch ? ogImageMatch[1] : undefined

    // Try to extract price from HTML
    let price: number | undefined
    const priceMatch = html.match(/(?:price|cost|amount)[^>]*>[\s$]*([\d,]+\.?\d*)/i)
    if (priceMatch) {
      const priceStr = priceMatch[1].replace(/,/g, '')
      const parsedPrice = parseFloat(priceStr)
      if (!isNaN(parsedPrice) && parsedPrice > 0) {
        price = parsedPrice
      }
    }

    // If no price found, try to extract from text
    if (!price) {
      price = extractPriceFromText(html) ?? undefined
    }

    return NextResponse.json({
      title,
      price,
      thumbnail,
    })
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    )
  }
}

