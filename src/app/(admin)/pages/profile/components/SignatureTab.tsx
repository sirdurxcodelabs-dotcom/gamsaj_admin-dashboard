import { useRef, useState } from 'react'
import { Alert, Button, Card, Spinner } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { uploadAPI } from '@/services/api'

interface Props {
  signature?: string
  onUpdated: () => void
}

const SignatureTab = ({ signature, onUpdated }: Props) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type)) {
      setMsg({ type: 'danger', text: 'Only JPG, PNG, GIF or WebP allowed.' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setMsg({ type: 'danger', text: 'Signature image must be under 2MB.' })
      return
    }

    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    try {
      setUploading(true)
      const res = await uploadAPI.uploadSignature(file)
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Signature updated successfully.' })
        setPreview(null)
        onUpdated()
      } else {
        setMsg({ type: 'danger', text: res.data.message || 'Upload failed.' })
        setPreview(null)
      }
    } catch (err: any) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Upload failed.' })
      setPreview(null)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const currentSig = preview || signature

  return (
    <div>
      <h5 className="mb-1">Digital Signature</h5>
      <p className="text-muted mb-3" style={{ fontSize: 13 }}>
        Your signature will appear on authorised documents (invoices, receipts) when enabled.
        Upload a clear image of your signature on a white background.
      </p>

      {msg && (
        <Alert variant={msg.type} dismissible onClose={() => setMsg(null)} className="mb-3">
          {msg.text}
        </Alert>
      )}

      <Card className="border p-3 mb-3" style={{ maxWidth: 400, background: '#fafafa' }}>
        {currentSig ? (
          <img
            src={currentSig}
            alt="Signature"
            style={{ maxHeight: 100, maxWidth: '100%', objectFit: 'contain' }}
          />
        ) : (
          <div className="text-center text-muted py-4" style={{ fontSize: 13 }}>
            <IconifyIcon icon="ri:pen-nib-line" style={{ fontSize: 32 }} />
            <p className="mt-2 mb-0">No signature uploaded yet</p>
          </div>
        )}
      </Card>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <Button
        variant="primary"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        {uploading
          ? <><Spinner size="sm" className="me-2" />Uploading...</>
          : <><IconifyIcon icon="ri:upload-2-line" className="me-2" />{signature ? 'Replace Signature' : 'Upload Signature'}</>
        }
      </Button>
      <p className="text-muted mt-2 mb-0" style={{ fontSize: 12 }}>
        Accepted: JPG, PNG, GIF, WebP — Max 2MB
      </p>
    </div>
  )
}

export default SignatureTab
