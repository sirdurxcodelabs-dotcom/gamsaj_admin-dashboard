import { useState } from 'react'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import ProjectsTable from './components/ProjectsTable'
import ProjectFormModal from './components/ProjectFormModal'
import ProjectViewModal from './components/ProjectViewModal'

export interface Project {
  _id: string
  title: string
  slug: string
  shortDescription: string
  description: string
  category: string
  location: string
  clientName: string
  status: 'planned' | 'ongoing' | 'on-hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  startDate?: string
  endDate?: string
  expectedCompletionDate?: string
  progressPercent: number
  featuredImage: { url: string; publicId?: string }
  galleryImages: { url: string; publicId?: string }[]
  assignedUsers: { _id: string; name: string; email: string; avatar?: string }[]
  projectManagerId?: { _id: string; name: string; email: string; avatar?: string }
  isPublishedToWebsite: boolean
  isFeatured: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

const ProjectsPage = () => {
  const [showForm, setShowForm] = useState(false)
  const [showView, setShowView] = useState(false)
  const [selected, setSelected] = useState<Project | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = () => setRefreshKey(k => k + 1)

  const handleEdit = (p: Project) => { setSelected(p); setShowForm(true) }
  const handleView = (p: Project) => { setSelected(p); setShowView(true) }
  const handleCreate = () => { setSelected(null); setShowForm(true) }

  return (
    <>
      <PageTitle title="Projects" />
      <Row>
        <Col xs={12}>
          <Card>
            <CardBody>
              <ProjectsTable
                refreshKey={refreshKey}
                onEdit={handleEdit}
                onView={handleView}
                onCreate={handleCreate}
                onRefresh={refresh}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>

      <ProjectFormModal
        show={showForm}
        project={selected}
        onHide={() => setShowForm(false)}
        onSaved={refresh}
      />

      <ProjectViewModal
        show={showView}
        project={selected}
        onHide={() => setShowView(false)}
        onEdit={() => { setShowView(false); setShowForm(true) }}
        onRefresh={refresh}
      />
    </>
  )
}

export default ProjectsPage
