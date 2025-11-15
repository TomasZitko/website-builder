import { useState, useRef, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { Send, Image as ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface MessageInputWithImagesProps {
  onSend: (message: string, images?: File[]) => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInputWithImages({
  onSend,
  disabled,
  placeholder = 'Type your message...'
}: MessageInputWithImagesProps) {
  const [input, setInput] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if ((input.trim() || images.length > 0) && !disabled) {
      onSend(input.trim(), images.length > 0 ? images : undefined)
      setInput('')
      setImages([])
      setImagePreviews([])
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Limit to 4 images max
    const newImages = [...images, ...files].slice(0, 4)
    setImages(newImages)

    // Create previews
    const previews = newImages.map(file => URL.createObjectURL(file))
    setImagePreviews(previews)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    // Revoke object URL to free memory
    URL.revokeObjectURL(imagePreviews[index])

    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="border-t border-border bg-panel p-4">
      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {imagePreviews.map((preview, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group"
            >
              <img
                src={preview}
                alt={`Preview ${idx + 1}`}
                className="w-20 h-20 object-cover rounded-lg border border-border"
              />
              <button
                onClick={() => removeImage(idx)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1
                         opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Image Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || images.length >= 4}
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-xl bg-panel border border-border',
            'hover:bg-accent/10 hover:border-accent transition-colors',
            'flex items-center justify-center',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          title="Upload image (max 4)"
        >
          <ImageIcon className="w-5 h-5 text-text-muted" />
        </button>

        {/* Message Textarea */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 resize-none bg-panel border border-border rounded-lg p-3
                   text-text placeholder:text-text-muted
                   focus:outline-none focus:ring-2 focus:ring-accent
                   min-h-[60px] max-h-[120px]
                   disabled:opacity-50 disabled:cursor-not-allowed"
          rows={2}
        />

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={(!input.trim() && images.length === 0) || disabled}
          className="self-end"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Image count hint */}
      {images.length > 0 && (
        <p className="text-xs text-text-muted mt-2">
          {images.length} / 4 images selected
        </p>
      )}
    </div>
  )
}
