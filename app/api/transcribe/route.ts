import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Save the file temporarily
  const tempFilePath = path.join('/tmp', file.name)
  await writeFile(tempFilePath, buffer)

  // Call the Python script
  const pythonProcess = spawn('python', ['api/transcribe.py', tempFilePath])

  return new Promise((resolve) => {
    let transcription = ''

    pythonProcess.stdout.on('data', (data) => {
      transcription += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`)
    })

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        resolve(NextResponse.json({ error: 'Transcription failed' }, { status: 500 }))
      } else {
        resolve(NextResponse.json({ transcription: transcription.trim() }))
      }
    })
  })
}

