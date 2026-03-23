import { useState, useEffect } from 'react'
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { companyInfoAPI } from '@/services/api'

interface Address {
  _id?: string
  label: string
  fullAddress: string
  city: string
  state: string
  country: string
  order: number
}

interface CompanyInfo {
  companyName: string; tagline: string; aboutText: string; rcNumber: string; foundedYear: string
  phone: string; phoneSecondary: string; email: string; emailSupport: string
  addresses: Address[]
  workingDays: string; workingHours: string
  facebook: string; twitter: string; instagram: string; linkedin: string; youtube: string; whatsapp: string
}

const EMPTY: CompanyInfo = {
  companyName: '', tagline: '', aboutText: '', rcNumber: '', foundedYear: '',
  phone: '', phoneSecondary: '', email: '', emailSupport: '',
  addresses: [],
  workingDays: '', workingHours: '',
  facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '', whatsapp: '',
}

const EMPTY_ADDRESS: Omit<Address, 'order'> = {
  label: '', fullAddress: '', city: '', state: '', country: '',
}

const MAX_ADDRESSES = 3

const Section = ({ title }: { title: string }) => (
  <div className="border-bottom pb-1 mb-3 mt-4">
    <h6 className="text-uppercase fw-semibold text-muted" style={{ fontSize: '0.72rem', letterSpacing: '0.06em' }}>{title}</h6>
  </div>
)

const AboutTab = () => {
  const [form, setForm] = useState<CompanyInfo>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    companyInfoAPI.get()
      .then(res => {
        if (res.data.success) {
          const data = res.data.data
          setForm({
            ...EMPTY,
            ...data,
            addresses: Array.isArray(data.addresses) ? data.addresses : [],
          })
        }
      })
      .catch(() => setError('Failed to load company information.'))
      .finally(() => setLoading(false))
  }, [])

  const set = (field: keyof CompanyInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  // Address helpers
  const setAddr = (index: number, field: keyof Omit<Address, 'order' | '_id'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => {
        const addresses = [...prev.addresses]
        addresses[index] = { ...addresses[index], [field]: e.target.value }
        return { ...prev, addresses }
      })
    }

  const addAddress = () => {
    if (form.addresses.length >= MAX_ADDRESSES) return
    setForm(prev => ({
      ...prev,
      addresses: [...prev.addresses, { ...EMPTY_ADDRESS, order: prev.addresses.length }],
    }))
  }

  const removeAddress = (index: number) => {
    setForm(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index).map((a, i) => ({ ...a, order: i })),
    }))
  }

  const moveAddress = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= form.addresses.length) return
    setForm(prev => {
      const addresses = [...prev.addresses]
      ;[addresses[index], addresses[target]] = [addresses[target], addresses[index]]
      return { ...prev, addresses: addresses.map((a, i) => ({ ...a, order: i })) }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.companyName.trim()) { setError('Company name is required.'); return }
    if (form.addresses.length > MAX_ADDRESSES) { setError('Maximum of 3 addresses allowed.'); return }
    try {
      setSaving(true)
      const res = await companyInfoAPI.update(form)
      if (res.data.success) {
        setSuccess('Company information saved successfully.')
        setTimeout(() => setSuccess(''), 4000)
      } else {
        setError(res.data.message || 'Save failed.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-5"><Spinner variant="primary" /></div>

  return (
    <Form onSubmit={handleSubmit}>
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Section title="Basic Information" />
      <Row className="g-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Company Name <span className="text-danger">*</span></Form.Label>
            <Form.Control value={form.companyName} onChange={set('companyName')} placeholder="GAMSAJ International Limited" required />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Tagline / Short Description</Form.Label>
            <Form.Control value={form.tagline} onChange={set('tagline')} placeholder="Building the future of Nigeria" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>RC Number</Form.Label>
            <Form.Control value={form.rcNumber} onChange={set('rcNumber')} placeholder="965221" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Founded Year</Form.Label>
            <Form.Control value={form.foundedYear} onChange={set('foundedYear')} placeholder="2011" />
          </Form.Group>
        </Col>
        <Col md={12}>
          <Form.Group>
            <Form.Label>About Text</Form.Label>
            <Form.Control as="textarea" rows={4} value={form.aboutText} onChange={set('aboutText')} placeholder="Brief description of the company..." />
          </Form.Group>
        </Col>
      </Row>

      <Section title="Contact Information" />
      <Row className="g-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Primary Phone</Form.Label>
            <Form.Control value={form.phone} onChange={set('phone')} placeholder="+234 800 000 0000" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Secondary Phone</Form.Label>
            <Form.Control value={form.phoneSecondary} onChange={set('phoneSecondary')} placeholder="+234 900 000 0000" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Email Address</Form.Label>
            <Form.Control type="email" value={form.email} onChange={set('email')} placeholder="info@gamsaj.com" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Support Email</Form.Label>
            <Form.Control type="email" value={form.emailSupport} onChange={set('emailSupport')} placeholder="support@gamsaj.com" />
          </Form.Group>
        </Col>
      </Row>

      {/* ── Address Manager ── */}
      <Section title="Addresses" />
      <div className="mb-2">
        <small className="text-muted">
          <i className="ri-information-line me-1" />
          1st address → header &amp; footer. 2nd address → footer. All 3 → contact page. Order matters.
        </small>
      </div>

      {form.addresses.map((addr, index) => (
        <div key={index} className="border rounded p-3 mb-3 bg-light">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>
              ADDRESS {index + 1}
              {index === 0 && <span className="badge bg-primary ms-2" style={{ fontSize: '0.65rem' }}>Header</span>}
              {index <= 1 && <span className="badge bg-secondary ms-1" style={{ fontSize: '0.65rem' }}>Footer</span>}
              {index <= 2 && <span className="badge bg-info ms-1" style={{ fontSize: '0.65rem' }}>Contact</span>}
            </span>
            <div className="d-flex gap-1">
              <Button size="sm" variant="outline-secondary" disabled={index === 0} onClick={() => moveAddress(index, -1)} title="Move up">
                <i className="ri-arrow-up-line" />
              </Button>
              <Button size="sm" variant="outline-secondary" disabled={index === form.addresses.length - 1} onClick={() => moveAddress(index, 1)} title="Move down">
                <i className="ri-arrow-down-line" />
              </Button>
              <Button size="sm" variant="outline-danger" onClick={() => removeAddress(index)} title="Remove">
                <i className="ri-delete-bin-line" />
              </Button>
            </div>
          </div>
          <Row className="g-2">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small mb-1">Office Label</Form.Label>
                <Form.Control size="sm" value={addr.label} onChange={setAddr(index, 'label')} placeholder="e.g. Head Office, Branch Office" />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small mb-1">Full Address</Form.Label>
                <Form.Control size="sm" value={addr.fullAddress} onChange={setAddr(index, 'fullAddress')} placeholder="Plot 123, Wuse Zone 5" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small mb-1">City</Form.Label>
                <Form.Control size="sm" value={addr.city} onChange={setAddr(index, 'city')} placeholder="Abuja" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small mb-1">State</Form.Label>
                <Form.Control size="sm" value={addr.state} onChange={setAddr(index, 'state')} placeholder="FCT" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small mb-1">Country</Form.Label>
                <Form.Control size="sm" value={addr.country} onChange={setAddr(index, 'country')} placeholder="Nigeria" />
              </Form.Group>
            </Col>
          </Row>
        </div>
      ))}

      {form.addresses.length < MAX_ADDRESSES ? (
        <Button variant="outline-primary" size="sm" onClick={addAddress}>
          <i className="ri-add-line me-1" />Add Address
        </Button>
      ) : (
        <div className="text-muted small">
          <i className="ri-error-warning-line me-1 text-warning" />
          Maximum of 3 addresses allowed.
        </div>
      )}

      <Section title="Working Hours" />
      <Row className="g-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Working Days</Form.Label>
            <Form.Control value={form.workingDays} onChange={set('workingDays')} placeholder="Mon - Sat" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Working Hours</Form.Label>
            <Form.Control value={form.workingHours} onChange={set('workingHours')} placeholder="8am - 5pm" />
          </Form.Group>
        </Col>
      </Row>

      <Section title="Social Media" />
      <Row className="g-3">
        {([
          ['facebook', 'Facebook URL'],
          ['twitter', 'Twitter / X URL'],
          ['instagram', 'Instagram URL'],
          ['linkedin', 'LinkedIn URL'],
          ['youtube', 'YouTube URL'],
          ['whatsapp', 'WhatsApp Number / Link'],
        ] as [keyof CompanyInfo, string][]).map(([field, label]) => (
          <Col md={6} key={field}>
            <Form.Group>
              <Form.Label>{label}</Form.Label>
              <Form.Control value={form[field] as string} onChange={set(field)} placeholder="https://..." />
            </Form.Group>
          </Col>
        ))}
      </Row>

      <div className="mt-4">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? <><Spinner size="sm" className="me-1" />Saving...</> : <>Save Changes</>}
        </Button>
      </div>
    </Form>
  )
}

export default AboutTab
