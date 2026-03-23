import { Modal, Button, Badge, Row, Col } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface Blog {
  _id: string
  title: string
  excerpt: string
  content: string
  category: string
  authorName: string
  status: 'draft' | 'published' | 'archived'
  views: number
  publishedAt?: string
  createdAt: string
  featuredImage: { url: string }
  tags: string[]
  featured: boolean
  slug?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    metaKeywords?: string[]
  }
}

interface BlogViewModalProps {
  show: boolean
  onHide: () => void
  blog: Blog | null
  onEdit: (blog: Blog) => void
}

const statusVariants: Record<string, string> = {
  published: 'success',
  draft: 'warning',
  archived: 'secondary',
}

const BlogViewModal = ({ show, onHide, blog, onEdit }: BlogViewModalProps) => {
  if (!blog) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const websiteUrl = import.meta.env.VITE_WEBSITE_URL || 'http://localhost:5174'

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <IconifyIcon icon="ri:article-line" />
          Blog Preview
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Featured image */}
        <div
          style={{
            width: '100%',
            height: '280px',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '24px',
            background: '#f0f0f0',
          }}
        >
          <img
            src={blog.featuredImage.url}
            alt={blog.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Title + badges */}
        <div className="d-flex flex-wrap align-items-start gap-2 mb-2">
          <h4 className="mb-0 me-2">{blog.title}</h4>
          <Badge bg={statusVariants[blog.status] || 'secondary'}>{blog.status}</Badge>
          {blog.featured && <Badge bg="info">Featured</Badge>}
        </div>

        {/* Meta row */}
        <div className="d-flex flex-wrap gap-3 text-muted mb-4" style={{ fontSize: '0.875rem' }}>
          <span>
            <IconifyIcon icon="ri:user-line" className="me-1" />
            {blog.authorName}
          </span>
          <span>
            <IconifyIcon icon="ri:folder-line" className="me-1" />
            {blog.category}
          </span>
          <span>
            <IconifyIcon icon="ri:eye-line" className="me-1" />
            {blog.views} views
          </span>
          <span>
            <IconifyIcon icon="ri:calendar-line" className="me-1" />
            {formatDate(blog.publishedAt || blog.createdAt)}
          </span>
          {blog.slug && (
            <span>
              <IconifyIcon icon="ri:link-m" className="me-1" />
              <code style={{ fontSize: '0.8rem' }}>{blog.slug}</code>
            </span>
          )}
        </div>

        <Row>
          <Col lg={8}>
            {/* Excerpt */}
            <div className="mb-4">
              <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                Excerpt
              </h6>
              <p className="mb-0">{blog.excerpt}</p>
            </div>

            {/* Content */}
            <div className="mb-4">
              <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                Content
              </h6>
              <div
                style={{
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '16px',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.9rem',
                  lineHeight: '1.7',
                }}
              >
                {blog.content}
              </div>
            </div>
          </Col>

          <Col lg={4}>
            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="mb-4">
                <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Tags
                </h6>
                <div className="d-flex flex-wrap gap-1">
                  {blog.tags.map((tag, i) => (
                    <Badge key={i} bg="light" text="dark" style={{ fontWeight: 400 }}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* SEO */}
            {(blog.seo?.metaTitle || blog.seo?.metaDescription) && (
              <div className="mb-4">
                <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  SEO
                </h6>
                {blog.seo.metaTitle && (
                  <p className="mb-1" style={{ fontSize: '0.85rem' }}>
                    <strong>Title:</strong> {blog.seo.metaTitle}
                  </p>
                )}
                {blog.seo.metaDescription && (
                  <p className="mb-0" style={{ fontSize: '0.85rem' }}>
                    <strong>Description:</strong> {blog.seo.metaDescription}
                  </p>
                )}
              </div>
            )}

            {/* Live link */}
            {blog.status === 'published' && blog.slug && (
              <div>
                <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Live URL
                </h6>
                <a
                  href={`${websiteUrl}/blog-details/${blog.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-success w-100"
                >
                  <IconifyIcon icon="ri:external-link-line" className="me-1" />
                  View on Website
                </a>
              </div>
            )}
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            onHide()
            onEdit(blog)
          }}
        >
          <IconifyIcon icon="ri:edit-line" className="me-1" />
          Edit Blog
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default BlogViewModal
