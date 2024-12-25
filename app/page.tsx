'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const data = await response.json()
      setTranscription(data.transcription)
    } catch (error) {
      console.error('Error:', error)
      setTranscription('Transcription failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Audio Transcription</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <Input type="file" onChange={handleFileChange} accept="audio/*" />
        <Button type="submit" disabled={!file || isLoading}>
          {isLoading ? 'Transcribing...' : 'Transcribe'}
        </Button>
      </form>
      {transcription && (
        <Textarea
          value={transcription}
          readOnly
          className="mt-8 w-full max-w-md h-64"
        />
      )}
    </main>
  )
}

