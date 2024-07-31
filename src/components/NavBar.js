import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav' // Import Nav component
import { useNavigate } from 'react-router-dom'
import Logo from '../assets/img/Logo-yellow.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

export default function NavBar() {
  const navigate = useNavigate()
  const handleLogout = () => {
    // Add your logout logic here
    // Remove token from localStorage
    localStorage.removeItem('token') // Adjust this based on where you store the token

    // Redirect to login page or any other actions
    navigate('/login')
    console.log('Logout')
  }
  return (
    <>
      <Navbar className=' bg-dark'>
        <Container>
          <Navbar.Brand href='/home'>
            <img
              alt=''
              src={Logo}
              width='30'
              height='30'
              className='d-inline-block align-top'
            />{' '}
            <span className='navbar-brand-text text-white'>PDA</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto'>
              <Nav.Link onClick={handleLogout} className='text-white'>
                <FontAwesomeIcon
                  icon={faSignOutAlt}
                  style={{ color: '#FFD43B' }}
                />{' '}
                Logout
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}
