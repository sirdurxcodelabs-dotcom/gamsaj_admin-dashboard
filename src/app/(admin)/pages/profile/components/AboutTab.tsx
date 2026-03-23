import { useState } from 'react'
import { Button, Col, Row, Form } from 'react-bootstrap'
import { ProfileData, UpdateProfileData } from '@/types/auth'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

type AboutTabProps = {
  profile: ProfileData
  onUpdate: (data: UpdateProfileData) => Promise<{ success: boolean; message: string }>
  updating: boolean
}

const AboutTab = ({ profile, onUpdate, updating }: AboutTabProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    bio: profile.bio,
    website: profile.website,
    socialMedia: {
      facebook: profile.socialMedia?.facebook || '',
      twitter: profile.socialMedia?.twitter || '',
      instagram: profile.socialMedia?.instagram || '',
      linkedin: profile.socialMedia?.linkedin || '',
    },
  })

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      bio: profile.bio,
      website: profile.website,
      socialMedia: {
        facebook: profile.socialMedia?.facebook || '',
        twitter: profile.socialMedia?.twitter || '',
        instagram: profile.socialMedia?.instagram || '',
        linkedin: profile.socialMedia?.linkedin || '',
      },
    })
    setIsEditing(false)
  }

  const handleSave = async () => {
    const result = await onUpdate(formData)
    if (result.success) {
      setIsEditing(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }))
  }

  return (
    <div className="profile-desk">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="text-uppercase fs-17 text-dark mb-0">{profile.name}</h5>
        {!isEditing && (
          <Button variant="soft-primary" size="sm" onClick={handleEdit}>
            <IconifyIcon icon="mdi:pencil" className="me-1" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="designation mb-3 text-muted">{profile.role.name}</div>

      {isEditing ? (
        <Form>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+234 800 000 0000"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Abuja, Nigeria"
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Website</Form.Label>
                <Form.Control
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <h6 className="mt-3 mb-2">Social Media Links</h6>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  <IconifyIcon icon="mdi:facebook" className="me-1" />
                  Facebook
                </Form.Label>
                <Form.Control
                  type="url"
                  value={formData.socialMedia.facebook}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/username"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  <IconifyIcon icon="mdi:twitter" className="me-1" />
                  Twitter
                </Form.Label>
                <Form.Control
                  type="url"
                  value={formData.socialMedia.twitter}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/username"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  <IconifyIcon icon="mdi:instagram" className="me-1" />
                  Instagram
                </Form.Label>
                <Form.Control
                  type="url"
                  value={formData.socialMedia.instagram}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  <IconifyIcon icon="mdi:linkedin" className="me-1" />
                  LinkedIn
                </Form.Label>
                <Form.Control
                  type="url"
                  value={formData.socialMedia.linkedin}
                  onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="mt-4">
            <Button variant="primary" onClick={handleSave} disabled={updating} className="me-2">
              <IconifyIcon icon="mdi:content-save" className="me-1" />
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="secondary" onClick={handleCancel} disabled={updating}>
              <IconifyIcon icon="mdi:close" className="me-1" />
              Cancel
            </Button>
          </div>
        </Form>
      ) : (
        <>
          <p className="text-muted fs-16 mb-4">{profile.bio || 'No bio available'}</p>

          <h5 className="mt-4 fs-17 text-dark">Contact Information</h5>
          <table className="table table-condensed table-bordered mb-0 border-top table-striped">
            <tbody>
              {profile.website && (
                <tr>
                  <th scope="row" style={{ width: '30%' }}>
                    Website
                  </th>
                  <td>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="ng-binding">
                      {profile.website}
                    </a>
                  </td>
                </tr>
              )}
              <tr>
                <th scope="row">Email</th>
                <td>
                  <a href={`mailto:${profile.email}`} className="ng-binding">
                    {profile.email}
                  </a>
                </td>
              </tr>
              {profile.phone && (
                <tr>
                  <th scope="row">Phone</th>
                  <td className="ng-binding">{profile.phone}</td>
                </tr>
              )}
              {profile.location && (
                <tr>
                  <th scope="row">Location</th>
                  <td className="ng-binding">{profile.location}</td>
                </tr>
              )}
            </tbody>
          </table>

          {(profile.socialMedia?.facebook ||
            profile.socialMedia?.twitter ||
            profile.socialMedia?.instagram ||
            profile.socialMedia?.linkedin) && (
            <>
              <h5 className="mt-4 fs-17 text-dark">Social Media</h5>
              <div className="d-flex gap-2 mt-3">
                {profile.socialMedia?.facebook && (
                  <a
                    href={profile.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn px-3 py-2 btn-soft-primary"
                  >
                    <IconifyIcon icon="mdi:facebook" className="fs-18" />
                  </a>
                )}
                {profile.socialMedia?.twitter && (
                  <a
                    href={profile.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn px-3 py-2 btn-soft-info"
                  >
                    <IconifyIcon icon="mdi:twitter" className="fs-18" />
                  </a>
                )}
                {profile.socialMedia?.instagram && (
                  <a
                    href={profile.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn px-3 py-2 btn-soft-danger"
                  >
                    <IconifyIcon icon="mdi:instagram" className="fs-18" />
                  </a>
                )}
                {profile.socialMedia?.linkedin && (
                  <a
                    href={profile.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn px-3 py-2 btn-soft-primary"
                  >
                    <IconifyIcon icon="mdi:linkedin" className="fs-18" />
                  </a>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default AboutTab
