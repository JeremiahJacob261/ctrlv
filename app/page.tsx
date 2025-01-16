'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Link from 'next/link'
import Cryptia from '@/lib/cryptia';
import { createClient } from '@supabase/supabase-js'


const URL = "https://vmzqgtstmtypihqzfryk.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtenFndHN0bXR5cGlocXpmcnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYyOTg2NjEsImV4cCI6MjA0MTg3NDY2MX0.YFPaADazz8hWfzJid5bxTYD2M4_X6KnxRco_VzLagtA";
const encryptionKey = "KRYGHAZXY89VB";
const supabase = createClient(URL, ANON)

export default function PastebinReplica() {

  // Initialize Cryptia with custom settings.
const cryptia = Cryptia({
  obfuscationLevel: 10,
  logging: true,
  preserveWhitespace: true
})

  const [code, setCode] = useState('')
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 4 || !/^[a-zA-Z0-9]{4}$/.test(code)) {
      toast.error('Please enter a valid 4-digit alphanumeric code')
      return
    }
    if (!content.trim()) {
      toast.error('Please enter some content to paste')
      return
    }
    
    let {data:contentx} = cryptia.encrypt(content, encryptionKey);  // used cryptia encryption
    
console.log(contentx,"hoookkm");
    const { data, error } = await supabase
      .from('pastes')
      .insert([{ code, content:contentx, title }])

    if (error) {
      toast.error('Failed to submit paste')
    } else {
      toast.success('Paste submitted successfully!')
      // Reset form
      setCode('')
      setContent('')
      setTitle('')
    }
  }

  const generateNewPaste = () => {
    setCode('')
    setContent('')
    setTitle('')
    toast.info('Started a new paste')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">CTRL V</h1>
        <div className="mb-4 text-center">
          <Link href="/list" className="text-blue-500 hover:underline">
            View All Pastes
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title/Hint
            </label>
            <Input
              id="title"
              type="text"
              placeholder="Enter a title or hint for your paste"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              4-Digit Code
            </label>
            <Input
              id="code"
              type="text"
              placeholder="Enter 4-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={4}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Paste Content
            </label>
            <Textarea
              id="content"
              placeholder="Enter your content here"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-40"
            />
          </div>
          <div className="flex space-x-2">
            <Button type="submit" className="flex-1">
              Submit Paste
            </Button>
            <Button type="button" onClick={generateNewPaste} variant="outline" className="flex-1">
              New Paste
            </Button>
          </div>
        </form>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  )
}

