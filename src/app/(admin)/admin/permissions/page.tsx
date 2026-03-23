import { useState, useEffect } from 'react'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Table, Badge, Spinner, Form, InputGroup } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { roleAPI } from '@/services/api'

interface Permission {
  _id: string; name: string; slug: string; category: string
  description?: string; resource?: string; action?: string; createdAt: string
}

const CATEGORY_COLORS: Record<string, string> = {
  main: 'primary', app: 'info', content: 'success', pages: 'warning', admin: 'danger',
}

const PermissionsPage = () => {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')

  useEffect(() => {
    roleAPI.getAllPermissions()
      .then(res => { if (res.data.success) setPermissions(res.data.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const categories = [...new Set(permissions.map(p => p.category))]

  const filtered = permissions.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCat || p.category === filterCat
    return matchSearch && matchCat
  })

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <>
      <PageTitle title="Permissions" />
      <Row>
        <Col xs={12}>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="mb-0">Permissions</h4>
                  <small className="text-muted">{permissions.length} permissions across {categories.length} categories</small>
                </div>
              </div>

              <Row className="g-2 mb-3">
                <Col md={5}>
                  <InputGroup size="sm">
                    <InputGroup.Text><IconifyIcon icon="ri:search-line" /></InputGroup.Text>
                    <Form.Control placeholder="Search permissions..." value={search}
                      onChange={e => setSearch(e.target.value)} />
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Form.Select size="sm" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </Form.Select>
                </Col>
              </Row>

              {loading ? (
                <div className="text-center py-5"><Spinner variant="primary" /></div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Permission Key</th>
                        <th>Display Name</th>
                        <th>Category</th>
                        <th>Resource</th>
                        <th>Action</th>
                        <th>Description</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-5 text-muted">No permissions found</td></tr>
                      ) : filtered.map(p => (
                        <tr key={p._id}>
                          <td><code style={{ fontSize: '0.8rem' }}>{p.slug}</code></td>
                          <td className="fw-medium">{p.name}</td>
                          <td>
                            <Badge bg={CATEGORY_COLORS[p.category] || 'secondary'}>
                              {p.category}
                            </Badge>
                          </td>
                          <td><small>{p.resource || '—'}</small></td>
                          <td><small>{p.action || '—'}</small></td>
                          <td><small className="text-muted">{p.description || '—'}</small></td>
                          <td><small>{fmt(p.createdAt)}</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default PermissionsPage
