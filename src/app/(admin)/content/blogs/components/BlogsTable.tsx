 import { useState, useEffect } from 'react'
import { Button, Table, Badge, Spinner } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { BlogFormModal, BlogViewModal } from './'
import { blogAPI } from '@/services/api'

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
  featuredImage: {
    url: string
  }
  tags: string[]
  featured: boolean
}

const BlogsTable = () => {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

  // Check auth status
  useEffect(() => {
    const authData = document.cookie
      .split('; ')
      .find((row) => row.startsWith('_TECHMIN_AUTH_KEY_='))
    
    if (authData) {
      try {
        const user = JSON.parse(decodeURIComponent(authData.split('=')[1]))
        setDebugInfo(`Authenticated as: ${user.name} (${user.email})`)
      } catch (error) {
        setDebugInfo('Auth cookie found but invalid')
      }
    } else {
      setDebugInfo('No authentication cookie found')
    }
  }, [])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      console.log('Fetching blogs...')

      // Check authentication
      const authData = document.cookie
        .split('; ')
        .find((row) => row.startsWith('_TECHMIN_AUTH_KEY_='))
      
      if (authData) {
        try {
          const user = JSON.parse(decodeURIComponent(authData.split('=')[1]))
          console.log('Auth user:', user.name, user.email)
          console.log('Token present:', !!user.token)
        } catch (e) {
          console.error('Error parsing auth data:', e)
        }
      } else {
        console.log('No auth cookie found')
      }

      const response = await blogAPI.getBlogs({
        status: 'all',
        limit: 100,
      })

      console.log('Blog API response:', response.data)

      if (response.data.success) {
        setBlogs(response.data.data)
        console.log('Blogs loaded:', response.data.data.length)
      } else {
        console.error('API returned success: false')
        setBlogs([])
      }
    } catch (error: any) {
      console.error('Error fetching blogs:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
      }
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleView = (blog: Blog) => {
    setSelectedBlog(blog)
    setShowViewModal(true)
  }

  const handleCreate = () => {
    setSelectedBlog(null)
    setShowModal(true)
  }

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return

    try {
      const response = await blogAPI.deleteBlog(id)

      if (response.data.success) {
        alert('Blog deleted successfully!')
        fetchBlogs()
      } else {
        alert('Failed to delete blog: ' + (response.data.message || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Error deleting blog:', error)
      if (error.response) {
        alert('Failed to delete blog: ' + (error.response.data.message || 'Server error'))
      } else {
        alert('Failed to delete blog: Network error')
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      published: 'success',
      draft: 'warning',
      archived: 'secondary',
    }
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading blogs...</p>
      </div>
    )
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Blog Posts</h4>
          <p className="text-muted mb-0">Manage your blog content</p>
          {debugInfo && (
            <small className="text-info d-block mt-1">
              <IconifyIcon icon="ri:information-line" className="me-1" />
              {debugInfo}
            </small>
          )}
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={fetchBlogs} disabled={loading}>
            <IconifyIcon icon="ri:refresh-line" className="me-1" />
            Refresh
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            <IconifyIcon icon="ri:add-line" className="me-1" />
            Create Blog
          </Button>
        </div>
      </div>

      <div className="table-responsive">
        <Table hover className="mb-0">
          <thead className="table-light">
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Author</th>
              <th>Status</th>
              <th>Views</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  <IconifyIcon icon="ri:article-line" className="fs-1 text-muted mb-2" />
                  <p className="text-muted mb-0">No blogs found. Create your first blog post!</p>
                </td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog._id}>
                  <td>
                    <img
                      src={blog.featuredImage.url}
                      alt={blog.title}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                  </td>
                  <td>
                    <div>
                      <strong>{blog.title}</strong>
                      {blog.featured && (
                        <Badge bg="info" className="ms-2" style={{ fontSize: '0.7rem' }}>
                          Featured
                        </Badge>
                      )}
                      <br />
                      <small className="text-muted">{blog.excerpt.substring(0, 60)}...</small>
                    </div>
                  </td>
                  <td>
                    <Badge bg="primary" pill>
                      {blog.category}
                    </Badge>
                  </td>
                  <td>{blog.authorName}</td>
                  <td>{getStatusBadge(blog.status)}</td>
                  <td>
                    <IconifyIcon icon="ri:eye-line" className="me-1" />
                    {blog.views}
                  </td>
                  <td>{formatDate(blog.publishedAt || blog.createdAt)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleView(blog)}
                        title="View"
                      >
                        <IconifyIcon icon="ri:eye-line" />
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleEdit(blog)}
                        title="Edit"
                      >
                        <IconifyIcon icon="ri:edit-line" />
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleDelete(blog._id)}
                        title="Delete"
                        className="text-danger"
                      >
                        <IconifyIcon icon="ri:delete-bin-line" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <BlogFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        blog={selectedBlog}
        onSuccess={fetchBlogs}
      />

      <BlogViewModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        blog={selectedBlog}
        onEdit={(blog) => {
          setSelectedBlog(blog)
          setShowModal(true)
        }}
      />
    </>
  )
}

export default BlogsTable
