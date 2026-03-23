import { Button, Nav } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

type EmailSidebarProps = {
  currentFolder: string
  onFolderChange: (folder: string) => void
  onCompose: () => void
  counts: {
    inbox?: number
    sent?: number
    draft?: number
    spam?: number
    unread?: number
  }
}

const EmailSidebar = ({ currentFolder, onFolderChange, onCompose, counts }: EmailSidebarProps) => {
  const folders = [
    { id: 'inbox', label: 'Inbox', icon: 'mdi:inbox', count: counts.inbox || 0, unread: counts.unread || 0 },
    { id: 'sent', label: 'Sent', icon: 'mdi:send', count: counts.sent || 0 },
    { id: 'draft', label: 'Drafts', icon: 'mdi:file-document-edit', count: counts.draft || 0 },
    { id: 'spam', label: 'Spam', icon: 'mdi:alert-octagon', count: counts.spam || 0 },
  ]

  return (
    <div className="email-sidebar border-end" style={{ width: '250px', minWidth: '250px' }}>
      <div className="p-3">
        <Button variant="primary" className="w-100 mb-3" onClick={onCompose}>
          <IconifyIcon icon="mdi:plus" className="me-2" />
          Compose
        </Button>

        <Nav className="flex-column">
          {folders.map((folder) => (
            <Nav.Link
              key={folder.id}
              className={`d-flex align-items-center justify-content-between py-2 px-3 rounded ${
                currentFolder === folder.id ? 'bg-primary text-white' : 'text-dark'
              }`}
              onClick={() => onFolderChange(folder.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center">
                <IconifyIcon icon={folder.icon} className="me-2 fs-18" />
                <span>{folder.label}</span>
              </div>
              {folder.id === 'inbox' && folder.unread > 0 ? (
                <span className={`badge ${currentFolder === folder.id ? 'bg-white text-primary' : 'bg-primary'}`}>
                  {folder.unread}
                </span>
              ) : folder.count > 0 ? (
                <span className="text-muted small">({folder.count})</span>
              ) : null}
            </Nav.Link>
          ))}
        </Nav>

        <hr className="my-3" />

        <div className="px-3">
          <h6 className="text-muted text-uppercase small mb-2">Labels</h6>
          <Nav className="flex-column">
            <Nav.Link className="d-flex align-items-center py-2 px-3 text-dark" style={{ cursor: 'pointer' }}>
              <IconifyIcon icon="mdi:star" className="me-2 text-warning" />
              <span>Starred</span>
            </Nav.Link>
            <Nav.Link className="d-flex align-items-center py-2 px-3 text-dark" style={{ cursor: 'pointer' }}>
              <IconifyIcon icon="mdi:flag" className="me-2 text-danger" />
              <span>Important</span>
            </Nav.Link>
          </Nav>
        </div>
      </div>
    </div>
  )
}

export default EmailSidebar
