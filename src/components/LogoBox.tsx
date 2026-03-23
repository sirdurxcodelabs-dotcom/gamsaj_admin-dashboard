
import { Link } from 'react-router-dom'

import logoSm from '@/assets/images/logo-sm.png'

const gamsajLogo = '/GamSaj Logo.png'

const LogoBox = () => {
  return (
    <>
      <Link to="/" className="logo logo-light">
        <span className="logo-lg">
          <img 
            src={gamsajLogo} 
            className="w-auto" 
            alt="GAMSAJ International Limited" 
            style={{ 
              maxHeight: '80px',
              padding: '10px 0',
              transition: 'all 0.3s ease'
            }} 
          />
        </span>
        <span className="logo-sm">
          <img src={logoSm} className="w-auto" alt="GAMSAJ" />
        </span>
      </Link>

      <Link to="/" className="logo logo-dark">
        <span className="logo-lg">
          <img 
            src={gamsajLogo} 
            alt="GAMSAJ International Limited" 
            className="w-auto" 
            style={{ 
              maxHeight: '80px',
              padding: '10px 0',
              transition: 'all 0.3s ease'
            }} 
          />
        </span>
        <span className="logo-sm">
          <img src={logoSm} alt="GAMSAJ" className="w-auto" />
        </span>
      </Link>
    </>
  )
}
export default LogoBox
