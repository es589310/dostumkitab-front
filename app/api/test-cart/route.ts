export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { book_id, quantity = 1 } = body

    console.log("Frontend Cart Test:", { book_id, quantity })

    if (!book_id) {
      return Response.json({ error: "book_id is required" }, { status: 400 })
    }

    // Test adding to backend cart
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"
    const response = await fetch(`${apiUrl}/orders/cart/add/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': 'frontend-test-device-' + Date.now()
      },
      body: JSON.stringify({ book_id, quantity })
    })

    console.log("Backend response status:", response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error:", errorText)
      return Response.json({ 
        error: "Backend error", 
        status: response.status, 
        details: errorText 
      }, { status: 500 })
    }

    const result = await response.json()
    console.log("Backend success:", result)
    
    return Response.json({
      success: true,
      backend_response: result,
      test_info: "Cart test via Next.js server to Django backend"
    })

  } catch (error) {
    console.error("Test cart error:", error)
    return Response.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}
