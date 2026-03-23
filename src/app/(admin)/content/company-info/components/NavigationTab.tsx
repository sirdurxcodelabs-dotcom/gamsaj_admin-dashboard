import { useEffect, useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import api from '@/services/api'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Card } from 'react-bootstrap'

interface NavigationItem {
  id: string; key: string; groupKey: string; title: string; path: string; order: number; isActive: boolean
}
interface NavigationGroup {
  id: string; key: string; title: string; type: 'single' | 'dropdown'; path?: string; order: number; isActive: boolean; items?: NavigationItem[]
}

const ItemTypes = { GROUP: 'group', ITEM: 'item' }

const DraggableGroup = ({ group, index, moveGroup, onEdit, onToggle, children }: any) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.GROUP,
    item: { type: ItemTypes.GROUP, id: group.id, index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  })
  const [, drop] = useDrop({
    accept: ItemTypes.GROUP,
    hover: (item: any) => {
      if (item.index !== index) { moveGroup(item.index, index); item.index = index }
    },
  })
  return (
    <div ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move', marginBottom: '1rem' }}>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
          <div className="d-flex align-items-center flex-grow-1">
            <i className="ri-drag-move-2-fill me-2 text-muted" style={{ cursor: 'grab' }}></i>
            <strong>{group.title}</strong>
            <span className="badge bg-secondary ms-2">{group.type}</span>
            {group.type === 'single' && group.path && <span className="text-muted ms-2 small">→ {group.path}</span>}
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(group)}><i className="ri-edit-line"></i></button>
            <div className="form-check form-switch mb-0">
              <input className="form-check-input" type="checkbox" checked={group.isActive} onChange={() => onToggle(group.id, group.isActive)} />
            </div>
          </div>
        </Card.Header>
        {group.type === 'dropdown' && <Card.Body>{children}</Card.Body>}
      </Card>
    </div>
  )
}

const DraggableItem = ({ item, index, groupKey, moveItem, onEdit, onToggle, allGroups }: any) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ITEM,
    item: { type: ItemTypes.ITEM, id: item.id, index, groupKey },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  })
  const [, drop] = useDrop({
    accept: ItemTypes.ITEM,
    hover: (draggedItem: any) => {
      if (draggedItem.groupKey === groupKey && draggedItem.index !== index) {
        moveItem(draggedItem.index, index, groupKey); draggedItem.index = index
      }
    },
    drop: (draggedItem: any) => {
      if (draggedItem.groupKey !== groupKey) {
        const targetGroup = allGroups.find((g: NavigationGroup) => g.key === groupKey)
        if (targetGroup?.type === 'dropdown') moveItem(draggedItem.index, index, groupKey, draggedItem.groupKey)
      }
    },
  })
  return (
    <tr ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}>
      <td><i className="ri-drag-move-2-fill text-muted"></i></td>
      <td><strong>{item.title}</strong></td>
      <td><code>{item.path}</code><small className="text-muted ms-2">(read-only)</small></td>
      <td>
        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(item, groupKey)}><i className="ri-edit-line"></i></button>
        <div className="form-check form-switch d-inline-block">
          <input className="form-check-input" type="checkbox" checked={item.isActive} onChange={() => onToggle(item.id, item.isActive)} />
        </div>
      </td>
    </tr>
  )
}

const NavigationTab = () => {
  const [navigation, setNavigation] = useState<NavigationGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [editType, setEditType] = useState<'group' | 'item'>('group')

  useEffect(() => { fetchNavigation() }, [])

  const fetchNavigation = async () => {
    try {
      setLoading(true)
      const response = await api.get('/navigation/admin')
      if (response.data.success) setNavigation(response.data.data)
      else setError('Failed to fetch navigation')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading navigation')
    } finally {
      setLoading(false)
    }
  }

  const moveGroup = async (fromIndex: number, toIndex: number) => {
    const newNav = [...navigation]
    const [moved] = newNav.splice(fromIndex, 1)
    newNav.splice(toIndex, 0, moved)
    setNavigation(newNav)
    try {
      await api.put('/navigation/admin/reorder', { type: 'groups', items: newNav.map((g, i) => ({ id: g.id, order: i + 1 })) })
    } catch { fetchNavigation() }
  }

  const moveItem = async (fromIndex: number, toIndex: number, targetGroupKey: string, sourceGroupKey?: string) => {
    const newNav = [...navigation]
    if (sourceGroupKey && sourceGroupKey !== targetGroupKey) {
      const src = newNav.find(g => g.key === sourceGroupKey)
      const tgt = newNav.find(g => g.key === targetGroupKey)
      if (src?.items && tgt?.items) {
        const [moved] = src.items.splice(fromIndex, 1)
        tgt.items.splice(toIndex, 0, { ...moved, groupKey: targetGroupKey })
        setNavigation(newNav)
        try {
          await api.put(`/navigation/admin/item/${moved.id}`, { groupKey: targetGroupKey, order: toIndex + 1 })
          fetchNavigation()
        } catch (err: any) { alert(err.response?.data?.message || 'Error moving item'); fetchNavigation() }
      }
    } else {
      const group = newNav.find(g => g.key === targetGroupKey)
      if (group?.items) {
        const [moved] = group.items.splice(fromIndex, 1)
        group.items.splice(toIndex, 0, moved)
        setNavigation(newNav)
        try {
          await api.put('/navigation/admin/reorder', { type: 'items', items: group.items.map((item, i) => ({ id: item.id, order: i + 1 })) })
        } catch { fetchNavigation() }
      }
    }
  }

  const handleSaveEdit = async () => {
    try {
      if (editType === 'group') {
        await api.put(`/navigation/admin/group/${editingItem.id}`, { title: editingItem.title, type: editingItem.type, path: editingItem.path, isActive: editingItem.isActive })
      } else {
        await api.put(`/navigation/admin/item/${editingItem.id}`, { title: editingItem.title, groupKey: editingItem.groupKey, isActive: editingItem.isActive })
      }
      setShowEditModal(false)
      fetchNavigation()
    } catch (err: any) { alert(err.response?.data?.message || 'Error saving changes') }
  }

  const handleToggleGroup = async (groupId: string, current: boolean) => {
    try {
      await api.put(`/navigation/admin/group/${groupId}`, { isActive: !current })
      setNavigation(prev => prev.map(g => g.id === groupId ? { ...g, isActive: !current } : g))
    } catch (err: any) { alert(err.response?.data?.message || 'Error') }
  }

  const handleToggleItem = async (itemId: string, current: boolean) => {
    try {
      await api.put(`/navigation/admin/item/${itemId}`, { isActive: !current })
      setNavigation(prev => prev.map(g => ({ ...g, items: g.items?.map(item => item.id === itemId ? { ...item, isActive: !current } : item) })))
    } catch (err: any) { alert(err.response?.data?.message || 'Error') }
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status" /></div>
  if (error) return (
    <div className="text-center py-5">
      <p className="text-danger">{error}</p>
      <button className="btn btn-primary" onClick={fetchNavigation}>Try Again</button>
    </div>
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-1">Website Navigation</h5>
          <p className="text-muted mb-0 small">Drag and drop to reorder groups and items.</p>
        </div>
        <button className="btn btn-sm btn-outline-secondary" onClick={fetchNavigation}><i className="ri-refresh-line me-1"></i>Refresh</button>
      </div>

      <div className="alert alert-info py-2 small">
        <i className="ri-information-line me-1"></i>
        Drag groups to reorder. Drag items within or between dropdown groups.
      </div>

      {navigation.map((group, index) => (
        <DraggableGroup key={group.id} group={group} index={index} moveGroup={moveGroup}
          onEdit={(g: NavigationGroup) => { setEditingItem(g); setEditType('group'); setShowEditModal(true) }}
          onToggle={handleToggleGroup}>
          {group.items && group.items.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead><tr><th style={{ width: 40 }}></th><th>Title</th><th>Route</th><th style={{ width: 150 }}>Actions</th></tr></thead>
                <tbody>
                  {group.items.map((item, itemIndex) => (
                    <DraggableItem key={item.id} item={item} index={itemIndex} groupKey={group.key}
                      moveItem={moveItem}
                      onEdit={(i: NavigationItem, gk: string) => { setEditingItem({ ...i, currentGroupKey: gk }); setEditType('item'); setShowEditModal(true) }}
                      onToggle={handleToggleItem} allGroups={navigation} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DraggableGroup>
      ))}

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit {editType === 'group' ? 'Group' : 'Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingItem && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} />
              </Form.Group>
              {editType === 'group' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Select value={editingItem.type} onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}>
                      <option value="single">Single Link</option>
                      <option value="dropdown">Dropdown</option>
                    </Form.Select>
                  </Form.Group>
                  {editingItem.type === 'single' && (
                    <Form.Group className="mb-3">
                      <Form.Label>Path</Form.Label>
                      <Form.Control value={editingItem.path || ''} onChange={(e) => setEditingItem({ ...editingItem, path: e.target.value })} placeholder="/path" />
                    </Form.Group>
                  )}
                </>
              )}
              {editType === 'item' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Path (Read-Only)</Form.Label>
                    <Form.Control value={editingItem.path} disabled />
                    <Form.Text className="text-muted">Routes cannot be changed to protect frontend</Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Move to Group</Form.Label>
                    <Form.Select value={editingItem.groupKey} onChange={(e) => setEditingItem({ ...editingItem, groupKey: e.target.value })}>
                      {navigation.filter(g => g.type === 'dropdown').map(g => <option key={g.key} value={g.key}>{g.title}</option>)}
                    </Form.Select>
                  </Form.Group>
                </>
              )}
              <Form.Group>
                <Form.Check type="checkbox" label="Active" checked={editingItem.isActive} onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })} />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveEdit}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </DndProvider>
  )
}

export default NavigationTab
