export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"
    console.log("Testing API connection from server:", apiUrl)
    
    const response = await fetch(`${apiUrl}/books/?is_featured=true`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': 'server-test-device'
      }
    })

    console.log("Server-side API test response:", response.status)
    
    if (!response.ok) {
      return Response.json({ 
        error: `API error: ${response.status}`,
        status: response.status 
      }, { status: 500 })
    }

    const data = await response.json()
    console.log("Server-side API test data:", data)
    
    return Response.json({
      success: true,
      status: response.status,
      dataCount: Array.isArray(data) ? data.length : (data.count || 'unknown'),
      firstBook: Array.isArray(data) ? data[0]?.title : data.results?.[0]?.title
    })
  } catch (error) {
    console.error("Server-side API test error:", error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
