import React from 'react'
import { Container, Form, Button, Col, Row } from 'react-bootstrap'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Logo from '../assets/img/Logo-yellow.png'
import Home from '../pda/Home'
export default function Login() {
  const [matricule, setMatricule] = useState('')
  const [password, setPassword] = useState('')
  const [login, setLogin] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:3000/login', {
        matricule,
        password,
      })

      console.log('Login successful:', response.data)
      setLogin(true)
      navigate('/home')
      // Redirect or perform other actions on success
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className='bg-dark text-white' style={{ minHeight: '100vh' }}>
      <Container className='py-5'>
        <Row className='justify-content-end mb-3'>
          <Col md={3} className='text-end'>
            <Link to='/register'>
              <Button variant='warning' size='sm'>
                Register
              </Button>
            </Link>
          </Col>
        </Row>
        <Col
          md={6}
          className='d-flex align-items-center justify-content-center'>
          <img
            src={Logo}
            alt='Enterprise Logo'
            style={{ maxWidth: '100%', height: 'auto', maxWidth: '800px' }}
          />
        </Col>
        <Row className='justify-content-center align-items-center'>
          <Col md={4}>
            <h2 className='mb-4'>Login</h2>
            <Form onSubmit={(e) => handleSubmit(e)}>
              <Form.Group controlId='formBasicMatricule'>
                <Form.Label>registration number
                </Form.Label>
                <Form.Control
                  type='text'
                  name='matricule'
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  placeholder=' ...'
                />
              </Form.Group>

              <Form.Group controlId='formBasicPassword' className='mb-3'>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type='password'
                  name='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='...'
                />
              </Form.Group>

              <Button
                variant='warning'
                type='submit'
                onClick={(e) => handleSubmit(e)}
                className='mr-2'>
                Login
              </Button>

              {login ? (
                <p className='text-success'>You are logged in successfully</p>
              ) : (
                <p className='text-danger'>You are not logged in</p>
              )}
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
