import React from 'react'
import { Container, Form, Button, Col, Row } from 'react-bootstrap'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Logo from '../assets/img/Logo-yellow.png'

export default function Register() {
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [matricule, setMatricule] = useState('')
  const [password, setPassword] = useState('')
  const [login, setLogin] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const validateDigitsOnly = (value) => {
    const digitPattern = /^[0-9]*$/
    return digitPattern.test(value)
  }

  const validateLength = (value) => {
    return value.length <= 8
  }

  const handleMatriculeChange = (e) => {
    const value = e.target.value
    if (!validateDigitsOnly(value)) {
      setErrorMessage('The registration number must contain only numbers.')
    } else if (!validateLength(value)) {
      setErrorMessage('The number must not exceed 8 digits.')
    } else {
      setMatricule(value)
      setErrorMessage('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (errorMessage) {
      return
    }

    try {
      const response = await axios.post('http://localhost:3000/register', {
        matricule,
        password,
      })

      console.log('Register successful:', response.data)
      setLogin(true)
      setErrorMessage('')
      // Clear the form fields
      setNom('')
      setPrenom('')
      setMatricule('')
      setPassword('')
      // Redirect or perform other actions on success
    } catch (error) {
      console.error('Register failed:', error)
      setLogin(false)
      setErrorMessage("L'enregistrement a échoué. Veuillez réessayer.")
    }
  }

  return (
    <div className='bg-dark text-white' style={{ minHeight: '100vh' }}>
      <Container className='py-5'>
        <Row className='justify-content-end mb-3'>
          <Col md={3} className='text-end'>
            <Link to='/login'>
              <Button variant='warning' size='sm'>
                Login
              </Button>
            </Link>
          </Col>
        </Row>
        <Col
          md={6}
          className='d-flex align-items-center justify-content-center'>
          <img
            src={Logo}
            alt='pda Logo'
            style={{ maxWidth: '100%', height: 'auto', maxWidth: '800px' }}
          />
        </Col>
        <Row className='justify-content-center align-items-center'>
          <Col md={4}>
            <h2 className='mb-4'>Register</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId='formBasicMatricule'>
                <Form.Label>Registration number</Form.Label>
                <Form.Control
                  type='text'
                  name='matricule'
                  value={matricule}
                  onChange={handleMatriculeChange}
                  placeholder=' ...'
                />
                {errorMessage && (
                  <Form.Text className='text-danger'>{errorMessage}</Form.Text>
                )}
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

              <Button variant='warning' type='submit' className='mr-2'>
                Register
              </Button>

              {login ? (
                <p className='text-success'>You are registered successfully</p>
              ) : (
                <p className='text-danger'>You are not registered</p>
              )}
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
