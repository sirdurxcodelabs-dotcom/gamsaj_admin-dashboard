import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Form, Modal } from 'react-bootstrap'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Card } from 'react-bootstrap'
import api from '@/services/api'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface NavItem { id: string; key: string; groupKey: string; title: string; path: string; order: number; isActive: boolean }
interface NavGroup { id: string; key: string; title: string; type: 'single' | 'dropdown'; path?: string; order: number; isActive: boolean; items?: NavItem[] }

const ItemTypes = { GROUP: 'group', ITEM: 'item' }

// ── Draggable Group ──────────────────────────────────────
const DraggableGroup = ({ group, index, moveGroup, onEdit, onToggle, onAddItem, children }: any) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.GROUP,
    item: { type: ItemTypes.GROUP, id: group.id, index },
    collect: m => ({ isDragging: m.isDragging() }),
  })
  const [, drop] = useDrop({
    accept: ItemTypes.GROUP,
    hover: (item: any) => { if (item.index !== index) { moveGroup(item.index, index); item.index = index } },
  })
  return (
    <div ref={n => drag(drop(n))} style={{ opacity: isDragging ? 0.4 : 1, marginBottom: '0.75rem' }}>
      <Card className="border">
        <Card.Header className="d-flex justify-content-between align-items-center py-2 bg-light-subtle">
          <div className="d-flex align-items-center gap-2 flex-grow-1">
            <i className="ri-drag-move-2-fill text-muted" style={{ cursor: 'grab' }} />
            <strong className="fs-14">{group.title}</strong>
            <Badge bg={group.type === 'single' ? 'info' : 'secondary'} className="text-capitalize">{group.type}</Badge>
            {group.type === 'single' && group.path && <code className="text-muted small">{group.path}</code>}
            {!group.isActive && <Badge bg="warning">Hidden</Badge>}
          </div>
          <div className="d-flex align-items-center gap-1">
            {group.type === 'dropdown' && (
              <Button size="sm" variant="soft-success" title="Add item" onClick={() => onAddItem(group)}>
                <IconifyIcon icon="ri:add-line" />
              </Button>
            )}
            <Button size="sm" variant="soft-primary" title="Edit" onClick={() => onEdit(group)}>
              <IconifyIcon icon="ri:edit-line" />
            </Button>
            <div className="form-check form-switch mb-0 ms-1">
              <input className="form-check-input" type="checkbox" checked={group.isActive} onChange={() => onToggle(group.id, group.isActive)} />
            </div>
          </div>
        </Card.Header>
        {group.type === 'dropdown' && (
          <Card.Body className="p-0">
            {children}
          </Card.Body>
        )}
      </Card>
    </div>
  )
}

// ── Draggable Item ───────────────────────────────────────
const DraggableItem = ({ item, index, groupKey, moveItem, onEdit, onToggle, allGroups }: any) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ITEM,
    item: { type: ItemTypes.ITEM, id: item.id, index, groupKey },
    collect: m => ({ isDragging: m.isDragging() }),
  })
  const [, drop] = useDrop({
    accept: ItemTypes.ITEM,
    hover: (dragged: any) => {
      if (dragged.groupKey === groupKey && dragged.index !== index) { moveItem(dragged.index, index, groupKey); dragged.index = index }
    },
    drop: (dragged: any) => {
      if (dragged.groupKey !== groupKey) {
        const tgt = allGroups.find((g: NavGroup) => g.key === groupKey)
        if (tgt?.type === 'dropdown') moveItem(dragged.index, index, groupKey, dragged.groupKey)
      }
    },
  })
  return (
    <tr ref={n => drag(drop(n))} style={{ opacity: isDragging ? 0.4 : 1, cursor: 'move' }}>
      <td><i className="ri-drag-move-2-fill text-muted" /></td>
      <td className="fw-semibold">{item.title}</td>
      <td><code className="small">{item.path}</code></td>
      <td>
        {!item.isActive && <Badge bg="warning" className="me-1">Hidden</Badge>}
      </td>
      <td className="text-end">
        <div className="d-flex gap-1 justify-content-end">
          <Button size="sm" variant="soft-primary" onClick={() => onEdit(item, groupKey)}>
            <IconifyIcon icon="ri:edit-line" />
          </Button>
          <div className="form-check form-switch mb-0 ms-1 d-flex align-items-center">
            <input className="form-check-input" type="checkbox" checked={item.isActive} onChange={() => onToggle(item.id, item.isActive)} />
          </div>
        </div>
      </td>
    </tr>
  )
}

// ── Main Component ───────────────────────────────────────
const NavigationTab = () => {
  const [navigation, setNavigation] = useState<NavGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  // Edit modal
  const [showEdit, setShowEdit] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [editType, setEditType] = useState<'group' | 'item'>('group')

  // Add Group modal
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [newGroup, setNewGroup] = useState({ title: '', type: 'single', path: '' })
  const [savingGroup, setSavingGroup] = useState(false)

  // Add Item modal
  const [showAddItem, setShowAddItem] = useState(false)
  const [addItemGroup, setAddItemGroup] = useState<NavGroup | null>(null)
  const [newItem, setNewItem] = useState({ title: '', path: '' })
  const [savingItem, setSavingItem] = useState(false)

  const showMsg = (type: 'success' | 'danger', text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => { fetchNav() }, [])

  const fetchNav = async () => {
    setLoading(true)
    try {
      const res = await api.get('/navigation/admin')
      if (res.data.success) setNavigation(res.data.data)
    } catch { showMsg('danger', 'Failed to load navigation') }
    finally { setLoading(false) }
  }

  // ── Drag handlers ──
  const moveGroup = async (from: number, to: number) => {
    const nav = [...navigation]
    const [m] = nav.splice(from, 1)
    nav.splice(to, 0, m)
    setNavigation(nav)
    try { await api.put('/navigation/admin/reorder', { type: 'groups', items: nav.map((g, i) => ({ id: g.id, order: i + 1 })) }) }
    catch { fetchNav() }
  }

  const moveItem = async (from: number, to: number, targetKey: string, sourceKey?: string) => {
    const nav = [...navigation]
    if (sourceKey && sourceKey !== targetKey) {
      const src = nav.find(g => g.key === sourceKey)
      const tgt = nav.find(g => g.key === targetKey)
      if (src?.items && tgt?.items) {
        const [m] = src.items.splice(from, 1)
        tgt.items.splice(to, 0, { ...m, groupKey: targetKey })
        setNavigation(nav)
        try { await api.put(`/navigation/admin/item/${m.id}`, { groupKey: targetKey, order: to + 1 }); fetchNav() }
        catch { fetchNav() }
      }
    } else {
      const group = nav.find(g => g.key === targetKey)
      if (group?.items) {
        const [m] = group.items.splice(from, 1)
        group.items.splice(to, 0, m)
        setNavigation(nav)
        try { await api.put('/navigation/admin/reorder', { type: 'items', items: group.items.map((it, i) => ({ id: it.id, order: i + 1 })) }) }
        catch { fetchNav() }
      }
    }
  }

  // ── Toggle ──
  const toggleGroup = async (id: string, cur: boolean) => {
    try {
      await api.put(`/navigation/admin/group/${id}`, { isActive: !cur })
      setNavigation(p => p.map(g => g.id === id ? { ...g, isActive: !cur } : g))
    } catch { showMsg('danger', 'Failed to update') }
  }

  const toggleItem = async (id: string, cur: boolean) => {
    try {
      await api.put(`/navigation/admin/item/${id}`, { isActive: !cur })
      setNavigation(p => p.map(g => ({ ...g, items: g.items?.map(it => it.id === id ? { ...it, isActive: !cur } : it) })))
    } catch { showMsg('danger', 'Failed to update') }
  }

  // ── Delete ── (navigation can only be hidden, not deleted)

  // ── Edit save ──
  const saveEdit = async () => {
    try {
      if (editType === 'group') {
        await api.put(`/navigation/admin/group/${editItem.id}`, {
          title: editItem.title, type: editItem.type, path: editItem.path, isActive: editItem.isActive,
        })
      } else {
        await api.put(`/navigation/admin/item/${editItem.id}`, {
          title: editItem.title, path: editItem.path, groupKey: editItem.groupKey, isActive: editItem.isActive,
        })
      }
      setShowEdit(false)
      showMsg('success', 'Saved successfully')
      fetchNav()
    } catch (err: any) { showMsg('danger', err.response?.data?.message || 'Save failed') }
  }

  // ── Add Group ──
  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingGroup(true)
    try {
      await api.post('/navigation/admin/group', newGroup)
      setShowAddGroup(false)
      setNewGroup({ title: '', type: 'single', path: '' })
      showMsg('success', 'Navigation group added')
      fetchNav()
    } catch (err: any) { showMsg('danger', err.response?.data?.message || 'Failed to add group') }
    finally { setSavingGroup(false) }
  }

  // ── Add Item ──
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addItemGroup) return
    setSavingItem(true)
    try {
      await api.post('/navigation/admin/item', { ...newItem, groupKey: addItemGroup.key })
      setShowAddItem(false)
      setNewItem({ title: '', path: '' })
      showMsg('success', 'Item added')
      fetchNav()
    } catch (err: any) { showMsg('danger', err.response?.data?.message || 'Failed to add item') }
    finally { setSavingItem(false) }
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>

  return (
    <DndProvider backend={HTML5Backend}>
      {toast && <Alert variant={toast.type} dismissible onClose={() => setToast(null)} className="mb-3">{toast.text}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-0">Website Navigation</h5>
          <p className="text-muted small mb-0">Drag to reorder. Add, edit or delete groups and items.</p>
        </div>
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-secondary" onClick={fetchNav}>
            <IconifyIcon icon="ri:refresh-line" className="me-1" />Refresh
          </Button>
          <Button size="sm" variant="primary" onClick={() => setShowAddGroup(true)}>
            <IconifyIcon icon="ri:add-line" className="me-1" />Add Group
          </Button>
        </div>
      </div>

      {navigation.length === 0 && (
        <div className="text-center text-muted py-4">No navigation groups yet. Add one above.</div>
      )}

      {navigation.map((group, index) => (
        <DraggableGroup
          key={group.id} group={group} index={index}
          moveGroup={moveGroup}
          onEdit={(g: NavGroup) => { setEditItem({ ...g }); setEditType('group'); setShowEdit(true) }}
          onToggle={toggleGroup}
          onAddItem={(g: NavGroup) => { setAddItemGroup(g); setNewItem({ title: '', path: '' }); setShowAddItem(true) }}
        >
          {group.items && group.items.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="bg-light-subtle">
                  <tr>
                    <th style={{ width: 32 }} />
                    <th>Title</th>
                    <th>Path</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((item, i) => (
                    <DraggableItem
                      key={item.id} item={item} index={i} groupKey={group.key}
                      moveItem={moveItem}
                      onEdit={(it: NavItem, gk: string) => { setEditItem({ ...it, groupKey: gk }); setEditType('item'); setShowEdit(true) }}
                      onToggle={toggleItem}
                      allGroups={navigation}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted small p-3 mb-0">No items yet. Click + to add items to this dropdown.</p>
          )}
        </DraggableGroup>
      ))}

      {/* ── Edit Modal ── */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit {editType === 'group' ? 'Group' : 'Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editItem && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control value={editItem.title} onChange={e => setEditItem({ ...editItem, title: e.target.value })} />
              </Form.Group>
              {editType === 'group' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Select value={editItem.type} onChange={e => setEditItem({ ...editItem, type: e.target.value })}>
                      <option value="single">Single Link</option>
                      <option value="dropdown">Dropdown</option>
                    </Form.Select>
                  </Form.Group>
                  {editItem.type === 'single' && (
                    <Form.Group className="mb-3">
                      <Form.Label>Path</Form.Label>
                      <Form.Control value={editItem.path || ''} onChange={e => setEditItem({ ...editItem, path: e.target.value })} placeholder="/about" />
                    </Form.Group>
                  )}
                </>
              )}
              {editType === 'item' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Path</Form.Label>
                    <Form.Control value={editItem.path || ''} onChange={e => setEditItem({ ...editItem, path: e.target.value })} placeholder="/page-path" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Move to Group</Form.Label>
                    <Form.Select value={editItem.groupKey} onChange={e => setEditItem({ ...editItem, groupKey: e.target.value })}>
                      {navigation.filter(g => g.type === 'dropdown').map(g => (
                        <option key={g.key} value={g.key}>{g.title}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </>
              )}
              <Form.Check type="switch" label="Active (visible on website)" checked={editItem.isActive}
                onChange={e => setEditItem({ ...editItem, isActive: e.target.checked })} />
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveEdit}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* ── Add Group Modal ── */}
      <Modal show={showAddGroup} onHide={() => setShowAddGroup(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Navigation Group</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddGroup}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control required value={newGroup.title} onChange={e => setNewGroup({ ...newGroup, title: e.target.value })} placeholder="e.g. ABOUT" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type *</Form.Label>
              <Form.Select value={newGroup.type} onChange={e => setNewGroup({ ...newGroup, type: e.target.value, path: '' })}>
                <option value="single">Single Link</option>
                <option value="dropdown">Dropdown Menu</option>
              </Form.Select>
            </Form.Group>
            {newGroup.type === 'single' && (
              <Form.Group className="mb-3">
                <Form.Label>Path *</Form.Label>
                <Form.Control required value={newGroup.path} onChange={e => setNewGroup({ ...newGroup, path: e.target.value })} placeholder="/about" />
                <Form.Text className="text-muted">Must start with /</Form.Text>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddGroup(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={savingGroup}>
              {savingGroup ? 'Adding...' : 'Add Group'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ── Add Item Modal ── */}
      <Modal show={showAddItem} onHide={() => setShowAddItem(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Item to "{addItemGroup?.title}"</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddItem}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control required value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} placeholder="e.g. About Us" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Path *</Form.Label>
              <Form.Control required value={newItem.path} onChange={e => setNewItem({ ...newItem, path: e.target.value })} placeholder="/about" />
              <Form.Text className="text-muted">Must match a route in the website (e.g. /about, /service)</Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddItem(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={savingItem}>
              {savingItem ? 'Adding...' : 'Add Item'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </DndProvider>
  )
}

export default NavigationTab
