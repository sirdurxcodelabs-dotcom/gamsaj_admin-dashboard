import { useState, useEffect } from 'react'
import { Row, Col, Card } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import EmailSidebar from './components/EmailSidebar'
import EmailList from './components/EmailList'
import EmailDetail from './components/EmailDetail'
import ComposeModal from './components/ComposeModal'
import { emailAPI } from '@/services/api'

const EmailApp = () => {
  const [currentFolder, setCurrentFolder] = useState('inbox')
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [replyToEmail, setReplyToEmail] = useState<any>(null)
  const [emails, setEmails] = useState<any[]>([])
  const [counts, setCounts] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetchEmails()
  }, [currentFolder, refreshKey])

  const fetchEmails = async () => {
    try {
      setLoading(true)
      const response = await emailAPI.getEmails({ folder: currentFolder })
      setEmails(response.data.data)
      setCounts(response.data.counts)
    } catch (error) {
      console.error('Error fetching emails:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSelect = async (email: any) => {
    try {
      const response = await emailAPI.getEmail(email._id)
      setSelectedEmail(response.data.data)
      fetchEmails() // Refresh to update unread count
    } catch (error) {
      console.error('Error fetching email:', error)
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
    setSelectedEmail(null)
  }

  const handleFolderChange = (folder: string) => {
    setCurrentFolder(folder)
    setSelectedEmail(null)
  }

  const handleCompose = () => {
    setReplyToEmail(null) // Clear any reply context
    setShowCompose(true)
  }

  const handleReply = () => {
    setReplyToEmail(selectedEmail) // Set the email to reply to
    setShowCompose(true)
  }

  const handleCloseCompose = () => {
    setShowCompose(false)
    setReplyToEmail(null) // Clear reply context when closing
  }

  return (
    <>
      <PageTitle title="Email" />

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body className="p-0">
              <div className="d-flex" style={{ height: 'calc(100vh - 200px)' }}>
                {/* Sidebar */}
                <EmailSidebar
                  currentFolder={currentFolder}
                  onFolderChange={handleFolderChange}
                  onCompose={handleCompose}
                  counts={counts}
                />

                {/* Email List */}
                <EmailList
                  emails={emails}
                  loading={loading}
                  selectedEmail={selectedEmail}
                  onEmailSelect={handleEmailSelect}
                  onRefresh={handleRefresh}
                  currentFolder={currentFolder}
                />

                {/* Email Detail */}
                {selectedEmail ? (
                  <EmailDetail
                    email={selectedEmail}
                    onClose={() => setSelectedEmail(null)}
                    onRefresh={handleRefresh}
                    onReply={handleReply}
                  />
                ) : (
                  <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light">
                    <div className="text-center">
                      <i className="mdi mdi-email-outline" style={{ fontSize: '80px', color: '#ccc' }}></i>
                      <h5 className="mt-3 text-muted">Select an email to read</h5>
                      <p className="text-muted">Choose an email from the list to view its contents</p>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Compose Modal */}
      <ComposeModal
        show={showCompose}
        onHide={handleCloseCompose}
        onSent={handleRefresh}
        replyTo={replyToEmail}
      />
    </>
  )
}

export default EmailApp
