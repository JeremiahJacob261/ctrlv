'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Cryptia from '@/lib/cryptia';
import { Lock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { createClient } from '@supabase/supabase-js'

const URL = "https://vmzqgtstmtypihqzfryk.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtenFndHN0bXR5cGlocXpmcnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYyOTg2NjEsImV4cCI6MjA0MTg3NDY2MX0.YFPaADazz8hWfzJid5bxTYD2M4_X6KnxRco_VzLagtA";
const encryptionKey = "KRYGHAZXY89VB";
// Initialize Supabase client
const supabase = createClient(URL, ANON)

interface Paste {
  id: number
  code: string
  content: string
  title: string
  created_at: string
}

export default function PasteList() {
  const [pastes, setPastes] = useState<Paste[]>([])
  const [selectedPaste, setSelectedPaste] = useState<Paste | null>(null)
  const [inputCode, setInputCode] = useState('')

  const cryptia = Cryptia({
    obfuscationLevel: 10,
    logging: true,
    preserveWhitespace: true
  })
  
  useEffect(() => {
    fetchPastes()
  }, [])

  async function fetchPastes() {
    const { data, error } = await supabase
      .from('pastes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to fetch pastes')
    } else {
      setPastes(data || [])
    }
  }

  function handlePasteClick(paste: Paste) {
    setSelectedPaste(paste)
    setInputCode('')
  }

  function handleCodeSubmit() {
    if (selectedPaste && inputCode === selectedPaste.code) {
      toast.success('Code correct! Displaying full content.')
    } else {
      toast.error('Incorrect code')
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  function decryptor(text:string){
   let {data: result} =  cryptia.decrypt(
      text,
      encryptionKey
    );
    return result;
  }

  function clipcopy(text:string) {
      navigator.clipboard.writeText(text).then(function() {
        toast.success('Copied to clipboard')
      }, function(err) {
        toast.error('Failed to copy to clipboard')
      });
  }
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">All Pastes</h1>
        <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
          Create New Paste
        </Link>
        <ul className="space-y-4">
          {pastes.map((paste) => (
            <li key={paste.id} className="bg-gray-50 p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{paste.title || 'Untitled'}</h2>
                <span className="text-sm text-gray-500">{formatDate(paste.created_at)}</span>
              </div>
              <p className="text-gray-700 mb-2 truncate">{paste.content}</p>
              <div className="flex justify-end">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => handlePasteClick(paste)}>
                      <Lock className="h-4 w-4 mr-2" />
                      View Full Content
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Enter 4-digit code</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        placeholder="Enter code"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        maxLength={4}
                      />
                      <Button onClick={handleCodeSubmit}>Submit</Button>
                    </div>
                    {selectedPaste && inputCode === selectedPaste.code && (
                      <div className="mt-4">
                        <h3 className="font-bold mb-2">{selectedPaste.title || 'Untitled'}</h3>
                        <p onClick={()=>{ clipcopy(decryptor(selectedPaste.content)) }} className="whitespace-pre-wrap">{decryptor(selectedPaste.content)}</p>
                      <p onClick={()=>{ clipcopy(decryptor(selectedPaste.content)) }}  className="text-sm text-blue-900">click to copy</p>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  )
}

