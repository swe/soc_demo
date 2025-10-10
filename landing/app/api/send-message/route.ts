import { NextRequest, NextResponse } from 'next/server'

const TELEGRAM_BOT_TOKEN = '7520557397:AAF46eQO4K7HiYNbuvRvqAbpjSapBsdglY8'
const TELEGRAM_CHAT_ID = '-1002362646822_11'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Format message for Telegram
    const telegramMessage = `
🆕 *New message from SOC Promo Website*

👤 *Name:* ${name}
📧 *Email:* ${email}
📞 *Phone:* ${phone || 'Not provided'}
🏢 *Company:* ${company || 'Not provided'}

💬 *Message:*
${message}

⏰ *Time:* ${new Date().toLocaleString('en-US', {
      timeZone: 'Europe/Moscow',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })}
    `.trim()

    // Send to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: 'Markdown',
        }),
      }
    )

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json()
      console.error('Telegram API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to send message to Telegram' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
