import PageTitle from '@/components/PageTitle'
import { Col, Row } from 'react-bootstrap'
import BillingList from './components/BillingList'
import { useLocation } from 'react-router-dom'

type BillingType = 'estimate' | 'invoice' | 'receipt' | ''

const pathConfig: Record<string, { type: BillingType; title: string }> = {
  '/apps/billing/estimates': { type: 'estimate', title: 'Estimates' },
  '/apps/billing/invoices':  { type: 'invoice',  title: 'Invoices'  },
  '/apps/billing/receipts':  { type: 'receipt',  title: 'Receipts'  },
}

const BillingPage = () => {
  const { pathname } = useLocation()
  const { type, title } = pathConfig[pathname] ?? { type: '', title: 'Documents' }

  return (
    <>
      <PageTitle title={title} />
      <Row>
        <Col xs={12}>
          <BillingList type={type} />
        </Col>
      </Row>
    </>
  )
}

export default BillingPage
