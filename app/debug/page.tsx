"use client"

import { useState } from "react"

export default function DebugPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serverResult, setServerResult] = useState<any>(null)
  const [serverLoading, setServerLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const testAPI = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("Testing API connection...")
      const response = await fetch("http://127.0.0.1:8000/api/books/?is_featured=true", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Device-ID": "test-device"
        },
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("API Response:", data)
      setResult(data)
    } catch (err) {
      console.error("API Error:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const testServerAPI = async () => {
    setServerLoading(true)
    setServerError(null)
    setServerResult(null)

    try {
      console.log("Testing server-side API connection...")
      const response = await fetch("/api/test", {
        method: "GET"
      })

      console.log("Server API Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Server API Response:", data)
      setServerResult(data)
    } catch (err) {
      console.error("Server API Error:", err)
      setServerError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setServerLoading(false)
    }
  }

  const testCartAPI = async () => {
    try {
      console.log("Testing cart functionality...")
      const response = await fetch("/api/test-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: 12, quantity: 1 }) // Use valid book ID
      })

      const data = await response.json()
      console.log("Cart test result:", data)
      alert(JSON.stringify(data, null, 2))
    } catch (err) {
      console.error("Cart test error:", err)
      alert("Cart test failed: " + (err instanceof Error ? err.message : "Unknown error"))
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Debug Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Direct API Test (Client → Backend)</h2>
          <button 
            onClick={testAPI}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Direct API Connection"}
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Server API Test (Client → Next.js → Backend)</h2>
          <button 
            onClick={testServerAPI}
            disabled={serverLoading}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {serverLoading ? "Testing..." : "Test Server API Connection"}
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Cart Functionality Test</h2>
          <button 
            onClick={testCartAPI}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Test Add to Cart
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {serverError && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <strong>Server API Error:</strong> {serverError}
        </div>
      )}

      {serverResult && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Server API Response:</h2>
          <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto text-sm">
            {JSON.stringify(serverResult, null, 2)}
          </pre>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Direct API Response:</h2>
          <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
