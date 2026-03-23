import { useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { ProfileData, UpdateProfileData } from '@/types/auth'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

type SettingsTabProps = {
  profile: ProfileData
  onUpdate: (data: UpdateProfileData) => Promise<{ success: boolean; message: string }>
  updating: boolean
}

const SettingsTab = ({ profile, onUpdate, updating }: SettingsTabProps) => {
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone || '',
    location: profile.location || '',
    bio: profile.bio || '',
    website: profile.website || '',
    socialMedia: {
      facebook: profile.socialMedia?.facebook || '',
      twitter: profile.socialMedia?.twitter || '',
      instagram: profile.socialMedia?.instagram || '',
      linkedin: profile.socialMedia?.linkedin || '',
    },
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
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

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL (starting with http:// or https://)'
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must not exceed 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    await onUpdate(formData)
  }

  return (
    <div className="user-profile-content">
      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                Full Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                isInvalid={!!errors.name}
                placeholder="Enter your full name"
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>
                Email <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                isInvalid={!!errors.email}
                placeholder="your.email@example.com"
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
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
                isInvalid={!!errors.website}
                placeholder="https://example.com"
              />
              <Form.Control.Feedback type="invalid">{errors.website}</Form.Control.Feedback>
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
                isInvalid={!!errors.bio}
                placeholder="Tell us about yourself..."
              />
              <Form.Text className="text-muted">{formData.bio.length}/500 characters</Form.Text>
              <Form.Control.Feedback type="invalid">{errors.bio}</Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={12}>
            <h6 className="mt-3 mb-2">
              <IconifyIcon icon="mdi:share-variant" className="me-2" />
              Social Media Links
            </h6>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <IconifyIcon icon="mdi:facebook" className="me-1 text-primary" />
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
                <IconifyIcon icon="mdi:twitter" className="me-1 text-info" />
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
                <IconifyIcon icon="mdi:instagram" className="me-1 text-danger" />
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
                <IconifyIcon icon="mdi:linkedin" className="me-1 text-primary" />
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
          <Button variant="primary" type="submit" disabled={updating}>
            <IconifyIcon icon="mdi:content-save-outline" className="me-1 fs-16 lh-1" />
            {updating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default SettingsTab
