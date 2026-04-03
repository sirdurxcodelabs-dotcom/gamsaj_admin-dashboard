import { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row, Table } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { billingAPI, userAPI } from '@/services/api'

interface Props {
  show: boolean
  onHide: () => void
  editDoc: any
  lockedType: 'estimate' | 'invoice' | 'receipt'
  onSaved: () => void
}

const emptyItem = () => ({ description: '', quantity: 1, unitPrice: 0, discount: 0 })

const BillingFormModal = ({ show, onHide, editDoc, lockedType, onSaved }: Props) => {
  const [saving, setSaving] = useState(false)
  const [sigUsers, setSigUsers] = useState<any[]>([])
  const [form, setForm] = useState<any>({
    clientName: '', clientEmail: '', clientPhone: '', clientAddress: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '', notes: '', terms: '',
    discountType: 'percent', discountValue: 0, taxRate: 0,
    status: 'draft', showSignature: false, signedBy: '',
    items: [emptyItem()],
  })

  // Load users who have a signature for the signedBy selector
  useEffect(() => {
    userAPI.getUsers({ limit: 100 }).then(res => {
      const all = res.data.data || res.data.users || []
      setSigUsers(all.filter((u: any) => u.signature))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (editDoc) {
      setForm({
        ...editDoc,
        issueDate: editDoc.issueDate ? editDoc.issueDate.split('T')[0] : '',
        dueDate: editDoc.dueDate ? editDoc.dueDate.split('T')[0] : '',
        signedBy: editDoc.signedBy?._id || editDoc.signedBy || '',
      })
    } else {
      setForm({
        clientName: '', clientEmail: '', clientPhone: '', clientAddress: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '', notes: '', terms: '',
        discountType: 'percent', discountValue: 0, taxRate: 0,
        status: 'draft', showSignature: false, signedBy: '',
        items: [emptyItem()],
      })
    }
  }, [editDoc, show])

  const set = (field: string, value: any) => setForm((p: any) => ({ ...p, [field]: value }))

  const setItem = (i: number, field: string, value: any) => {
    const items = [...form.items]
    items[i] = { ...items[i], [field]: value }
    setForm((p: any) => ({ ...p, items }))
  }

  const addItem = () => setForm((p: any) => ({ ...p, items: [...p.items, emptyItem()] }))
  const removeItem = (i: number) => setForm((p: any) => ({ ...p, items: p.items.filter((_: any, idx: number) => idx !== i) }))

  const calcSubtotal = () => form.items.reduce((sum: number, it: any) => {
    const gross = (it.quantity || 0) * (it.unitPrice || 0)
    return sum + gross - (gross * (it.discount || 0)) / 100
  }, 0)

  const calcTotal = () => {
    const sub = calcSubtotal()
    const afterDisc = form.discountType === 'percent'
      ? sub - (sub * (form.discountValue || 0)) / 100
      : sub - (form.discountValue || 0)
    return afterDisc + (afterDisc * (form.taxRate || 0)) / 100
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editDoc) {
        await billingAPI.update(editDoc._id, form)
      } else {
        await billingAPI.create({ ...form, type: lockedType })
      }
      onSaved()
      onHide()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
        {editDoc ? `Edit ${editDoc.documentNumber}` : `New ${lockedType.charAt(0).toUpperCase() + lockedType.slice(1)}`}
      </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3">
            {/* Client Info */}
            <Col xs={12}><h6 className="text-muted mb-0">Client Information</h6></Col>
            <Col md={6}>
              <Form.Label>Client Name *</Form.Label>
              <Form.Control required value={form.clientName} onChange={e => set('clientName', e.target.value)} />
            </Col>
            <Col md={6}>
              <Form.Label>Client Email</Form.Label>
              <Form.Control type="email" value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} />
            </Col>
            <Col md={6}>
              <Form.Label>Client Phone</Form.Label>
              <Form.Control value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} />
            </Col>
            <Col md={6}>
              <Form.Label>Client Address</Form.Label>
              <Form.Control value={form.clientAddress} onChange={e => set('clientAddress', e.target.value)} />
            </Col>

            {/* Dates */}
            <Col xs={12}><hr className="my-1" /><h6 className="text-muted mb-0">Dates & Status</h6></Col>
            <Col md={4}>
              <Form.Label>Issue Date</Form.Label>
              <Form.Control type="date" value={form.issueDate} onChange={e => set('issueDate', e.target.value)} />
            </Col>
            <Col md={4}>
              <Form.Label>Due Date</Form.Label>
              <Form.Control type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </Col>
            <Col md={4}>
              <Form.Label>Status</Form.Label>
              <Form.Select value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>

            {/* Line Items */}
            <Col xs={12}><hr className="my-1" /><h6 className="text-muted mb-0">Line Items</h6></Col>
            <Col xs={12}>
              <Table bordered size="sm" className="align-middle">
                <thead className="bg-light-subtle">
                  <tr>
                    <th style={{ width: '40%' }}>Description</th>
                    <th>Qty</th>
                    <th>Unit Price (₦)</th>
                    <th>Discount (%)</th>
                    <th>Line Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item: any, i: number) => {
                    const gross = (item.quantity || 0) * (item.unitPrice || 0)
                    const lineTotal = gross - (gross * (item.discount || 0)) / 100
                    return (
                      <tr key={i}>
                        <td><Form.Control size="sm" required value={item.description} onChange={e => setItem(i, 'description', e.target.value)} /></td>
                        <td><Form.Control size="sm" type="number" min={0} value={item.quantity} onChange={e => setItem(i, 'quantity', parseFloat(e.target.value) || 0)} /></td>
                        <td><Form.Control size="sm" type="number" min={0} value={item.unitPrice} onChange={e => setItem(i, 'unitPrice', parseFloat(e.target.value) || 0)} /></td>
                        <td><Form.Control size="sm" type="number" min={0} max={100} value={item.discount} onChange={e => setItem(i, 'discount', parseFloat(e.target.value) || 0)} /></td>
                        <td className="text-end">₦{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="text-center">
                          <Button size="sm" variant="soft-danger" onClick={() => removeItem(i)} disabled={form.items.length === 1}>
                            <IconifyIcon icon="ri:delete-bin-line" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
              <Button size="sm" variant="soft-primary" onClick={addItem}>
                <IconifyIcon icon="ri:add-line" className="me-1" />Add Item
              </Button>
            </Col>

            {/* Totals */}
            <Col xs={12}><hr className="my-1" /></Col>
            <Col md={4}>
              <Form.Label>Overall Discount</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select value={form.discountType} onChange={e => set('discountType', e.target.value)} style={{ width: 100 }}>
                  <option value="percent">%</option>
                  <option value="fixed">₦ Fixed</option>
                </Form.Select>
                <Form.Control type="number" min={0} value={form.discountValue} onChange={e => set('discountValue', parseFloat(e.target.value) || 0)} />
              </div>
            </Col>
            <Col md={4}>
              <Form.Label>Tax / VAT (%)</Form.Label>
              <Form.Control type="number" min={0} max={100} value={form.taxRate} onChange={e => set('taxRate', parseFloat(e.target.value) || 0)} />
            </Col>
            <Col md={4} className="d-flex flex-column justify-content-end">
              <div className="text-end">
                <div className="text-muted">Subtotal: <strong>₦{calcSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></div>
                <div className="fs-5 fw-bold text-primary">Total: ₦{calcTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
            </Col>

            {/* Notes */}
            <Col md={6}>
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
            </Col>
            <Col md={6}>
              <Form.Label>Terms & Conditions</Form.Label>
              <Form.Control as="textarea" rows={3} value={form.terms} onChange={e => set('terms', e.target.value)} />
            </Col>

            {/* Signature */}
            <Col xs={12}>
              <Form.Check
                type="switch"
                label="Show authorised signature on document"
                checked={form.showSignature}
                onChange={e => set('showSignature', e.target.checked)}
              />
            </Col>
            {form.showSignature && (
              <Col md={6}>
                <Form.Label>Authorised Signatory</Form.Label>
                <Form.Select value={form.signedBy} onChange={e => set('signedBy', e.target.value)}>
                  <option value="">— Select signatory —</option>
                  {sigUsers.map((u: any) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role?.name || u.roleId})</option>
                  ))}
                </Form.Select>
                {sigUsers.length === 0 && (
                  <Form.Text className="text-muted">No users with uploaded signatures found.</Form.Text>
                )}
              </Col>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : editDoc ? 'Update' : `Create ${lockedType.charAt(0).toUpperCase() + lockedType.slice(1)}`}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default BillingFormModal
