import { useState, useEffect } from 'react'
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap'
import { uploadAPI, blogAPI } from '@/services/api'

interface Blog {
  _id?: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  featuredImage: {
    url: string
    publicId?: string
  }
  seo?: {
    metaTitle?: string
    metaDescription?: string
    metaKeywords?: string[]
  }
  // Additional fields for table display
  authorName?: string
  views?: number
  publishedAt?: string
  createdAt?: string
}

interface BlogFormModalProps {
  show: boolean
  onHide: () => void
  blog: Blog | null
  onSuccess: () => void
}

const BlogFormModal = ({ show, onHide, blog, onSuccess }: BlogFormModalProps) => {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<Blog>({
    title: '',
    excerpt: '',
    content: '',
    category: 'Construction',
    tags: [],
    status: 'draft',
    featured: false,
    featuredImage: {
      url: '',
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
    },
  })

  useEffect(() => {
    if (blog) {
      setFormData(blog)
    } else {
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: 'Construction',
        tags: [],
        status: 'draft',
        featured: false,
        featuredImage: {
          url: '',
        },
        seo: {
          metaTitle: '',
          metaDescription: '',
          metaKeywords: [],
        },
      })
    }
  }, [blog, show])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const response = await uploadAPI.uploadSingle(file)
      
      if (response.data.success) {
        setFormData((prev) => ({
          ...prev,
          featuredImage: {
            url: response.data.data.url,
            publicId: response.data.data.publicId,
          },
        }))
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean)
    setFormData((prev) => ({ ...prev, tags }))
  }

  const fillDemoData = () => {
    setFormData({
      title: 'Modern Construction Techniques for Sustainable Building',
      excerpt: 'Discover the latest innovations in construction technology that are revolutionizing the building industry. From eco-friendly materials to smart building systems, learn how GAMSAJ International is leading the way in sustainable construction practices.',
      content: `# Introduction to Modern Construction

The construction industry is experiencing a revolutionary transformation with the integration of sustainable practices and cutting-edge technology. At GAMSAJ International Limited, we are at the forefront of this evolution, implementing innovative solutions that not only meet today's building standards but also anticipate tomorrow's needs.

## Sustainable Building Materials

One of the most significant shifts in modern construction is the adoption of eco-friendly materials. These materials reduce environmental impact while maintaining structural integrity and aesthetic appeal.

### Key Benefits:
- Reduced carbon footprint
- Lower energy consumption
- Improved indoor air quality
- Long-term cost savings

## Smart Building Systems

Integration of IoT (Internet of Things) devices and smart systems has transformed how buildings operate. From automated climate control to energy-efficient lighting, these systems optimize resource usage and enhance occupant comfort.

## GAMSAJ's Commitment

At GAMSAJ International Limited, we combine traditional craftsmanship with modern innovation. Our projects across Nigeria demonstrate our commitment to:

1. **Quality Excellence** - Every project meets the highest standards
2. **Sustainability** - Environmental responsibility in all our work
3. **Innovation** - Embracing new technologies and methods
4. **Client Satisfaction** - Delivering beyond expectations

## Conclusion

The future of construction lies in sustainable, smart, and efficient building practices. GAMSAJ International Limited is proud to lead this transformation in Nigeria, creating structures that stand the test of time while respecting our environment.

Contact us today to learn how we can bring these innovative solutions to your next project.`,
      category: 'Construction',
      tags: ['construction', 'sustainability', 'innovation', 'building', 'technology', 'eco-friendly'],
      status: 'draft',
      featured: true,
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
      },
      seo: {
        metaTitle: 'Modern Construction Techniques | GAMSAJ International',
        metaDescription: 'Learn about sustainable building practices and modern construction techniques from GAMSAJ International Limited, Nigeria\'s leading construction company.',
        metaKeywords: ['construction', 'sustainable building', 'GAMSAJ', 'Nigeria construction', 'modern building'],
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.excerpt || !formData.content || !formData.featuredImage.url) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)

      if (blog?._id) {
        // Update existing blog
        const response = await blogAPI.updateBlog(blog._id, formData)
        if (response.data.success) {
          alert('Blog updated successfully!')
        }
      } else {
        // Create new blog
        const response = await blogAPI.createBlog(formData)
        if (response.data.success) {
          alert('Blog created successfully!')
        }
      }

      onSuccess()
      onHide()
    } catch (error: any) {
      console.error('Error saving blog:', error)
      if (error.response) {
        alert('Failed to save blog: ' + (error.response.data.message || 'Server error'))
      } else {
        alert('Failed to save blog: Network error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>{blog ? 'Edit Blog' : 'Create New Blog'}</Modal.Title>
        {!blog && (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={fillDemoData}
            className="ms-auto me-2"
            style={{ fontSize: '0.85rem' }}
          >
            <i className="ri-magic-line me-1"></i>
            Fill Demo Data
          </Button>
        )}
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Title <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter blog title"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  Excerpt <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Brief description (max 500 characters)"
                  maxLength={500}
                  required
                />
                <Form.Text className="text-muted">
                  {formData.excerpt.length}/500 characters
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  Content <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={10}
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your blog content here..."
                  required
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Featured Image <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="text-center mt-2">
                    <Spinner animation="border" size="sm" />
                    <small className="d-block">Uploading...</small>
                  </div>
                )}
                {formData.featuredImage.url && (
                  <img
                    src={formData.featuredImage.url}
                    alt="Preview"
                    className="mt-2"
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select name="category" value={formData.category} onChange={handleChange}>
                  <option value="Construction">Construction</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Business">Business</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Building">Building</option>
                  <option value="Legal">Legal</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tags</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={handleTagsChange}
                  placeholder="Separate tags with commas"
                />
                <Form.Text className="text-muted">
                  e.g., construction, building, renovation
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={formData.status} onChange={handleChange}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="featured"
                  label="Mark as Featured"
                  checked={formData.featured}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />

          <h6 className="mb-3">SEO Settings (Optional)</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Meta Title</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.seo?.metaTitle || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, metaTitle: e.target.value },
                    }))
                  }
                  placeholder="SEO title"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Meta Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.seo?.metaDescription || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, metaDescription: e.target.value },
                    }))
                  }
                  placeholder="SEO description"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading || uploading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>{blog ? 'Update Blog' : 'Create Blog'}</>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default BlogFormModal
