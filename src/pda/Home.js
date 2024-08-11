import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faSearch,
  faPlus,
  faFilter,
  faBarcode,
} from '@fortawesome/free-solid-svg-icons'
import Navbar from '../components/NavBar'
import axios from 'axios'
import { Modal, Button, Form, ProgressBar, Alert, Badge } from 'react-bootstrap'
import { useZxing } from 'react-zxing'
import BarcodeScanner from '../pda/scan'

export default function Home() {
  const [ofList, setOfList] = useState([])
  const [searchText, setSearchText] = useState('')
  const [filteredOfList, setFilteredOfList] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedOf, setSelectedOf] = useState(null)
  const [productCodes, setProductCodes] = useState({})
  const [currentCode, setCurrentCode] = useState('')
  const [productAvailability, setProductAvailability] = useState([])
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    const fetchOfList = async () => {
      try {
        const response = await axios.get('http://localhost:3000/ofs/list')
        setOfList(response.data.ofList)
        setFilteredOfList(response.data.ofList)
      } catch (error) {
        console.error('Error fetching the list of OFs:', error)
      }
    }

    fetchOfList()
  }, [])

  useEffect(() => {
    const filteredByText = ofList.filter((of) =>
      of.ofNumber.toString().includes(searchText)
    )
    const filteredByStatus = filterByStatus(filteredByText)
    setFilteredOfList(filteredByStatus)
  }, [searchText, ofList, statusFilter])

  const filterByStatus = (ofList) => {
    if (statusFilter === 'All') {
      return ofList
    }
    return ofList.filter((of) => determineOfStatus(of) === statusFilter)
  }

  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  const handleShowModal = async (of) => {
    setSelectedOf(of)
    setShowModal(true)
    setProductCodes({})
    setProductAvailability([])
    setAlertMessage('') // Clear any previous alert messages

    try {
      const availabilityPromises = of.products.map((product) =>
        axios.post('http://localhost:3000/stocks/check-availability', {
          productName: product.productName,
          quantity: product.quantity,
        })
      )

      const availabilityResults = await Promise.all(availabilityPromises)
      const availabilityData = availabilityResults.map((result) => result.data)
      setProductAvailability(availabilityData)
    } catch (error) {
      console.error('Error checking product availability:', error)
      setProductAvailability(
        of.products.map(() => ({
          available: false,
          message: 'Error checking product availability.',
        }))
      )
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedOf(null)
    setAlertMessage('') // Clear any alert messages when closing modal
  }

  const handleAddCode = async (productIndex) => {
    const product = selectedOf.products[productIndex]

    // Check if the code has already been added
    if (productCodes[product.productName]?.includes(currentCode)) {
      setAlertMessage('Code already added.')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      return
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/stocks/check-code',
        {
          productName: product.productName,
          code: currentCode,
        }
      )

      if (response.data.valid) {
        setProductCodes((prevCodes) => ({
          ...prevCodes,
          [product.productName]: [
            ...(prevCodes[product.productName] || []),
            currentCode,
          ],
        }))
        setCurrentCode('')
      } else {
        // Only show alert if code is invalid
        setAlertMessage('Invalid code.')
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 3000)
      }
    } catch (error) {
      console.error('Error checking code:', error)
      setAlertMessage('Error checking code.')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }
  const [result, setResult] = useState('')
  const { ref } = useZxing({
    onDecodeResult: (result) => {
      setResult(result.getText())
    },
  })

  const handleSaveCodes = async () => {
    try {
      const savePromises = selectedOf.products
        .filter(
          (product) =>
            productCodes[product.productName] &&
            productCodes[product.productName].length > 0
        )
        .map((product) => {
          const codes = productCodes[product.productName].map((code) =>
            Number(code)
          )

          return axios.post(
            'http://localhost:3000/stocks/validate-remove-codes',
            {
              productName: product.productName,
              codes,
              ofNumber: selectedOf.ofNumber,
            }
          )
        })

      const saveResults = await Promise.all(savePromises)
      const success = saveResults.every((result) => result.data.success)

      if (success) {
        alert('Codes validated and processed from stock.')

        const response = await axios.get('http://localhost:3000/ofs/list')
        setOfList(response.data.ofList)
        setFilteredOfList(response.data.ofList)

        handleCloseModal()
      } else {
        alert('Error validating and processing codes.')
      }
    } catch (error) {
      console.error('Error validating and processing product codes:', error)
      alert('Error validating and processing product codes.')
    }
  }

  const progress = (productIndex) => {
    const product = selectedOf.products[productIndex]
    return (product.addedQuantity / product.quantity) * 100
  }

  const remainingQuantity = (productIndex) => {
    const product = selectedOf.products[productIndex]
    return product.quantity - product.addedQuantity
  }

  const isQuantitySufficient = (productIndex) => {
    const product = selectedOf.products[productIndex]
    return product.addedQuantity <= product.quantity
  }

  const determineOfStatus = (of) => {
    let status = 'Not Started'
    let allProductsStarted = false
    let allProductsCompleted = true

    of.products.forEach((product) => {
      const remainingQty = product.quantity - product.addedQuantity
      if (remainingQty === product.quantity) {
        allProductsCompleted = false
      } else if (remainingQty > 0) {
        status = 'In Progress'
        allProductsStarted = true
        allProductsCompleted = false
      } else {
        allProductsStarted = true
      }
    })

    if (allProductsCompleted) {
      status = 'Completed'
    } else if (!allProductsStarted) {
      status = 'Not Started'
    }

    return status
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Not Started':
        return { color: 'red', fontWeight: 'bold' }
      case 'In Progress':
        return { color: 'blue', fontWeight: 'bold' }
      case 'Completed':
        return { color: 'green', fontWeight: 'bold' }
      default:
        return {}
    }
  }

  return (
    <>
      <Navbar />
      <div
        className='d-flex flex-column align-items-center'
        style={{
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
          color: '#343a40',
          padding: '20px',
        }}>
        <div
          className='search-bar-container d-flex align-items-center mb-4'
          style={{
            maxWidth: '600px',
            width: '100%',
          }}>
          <input
            type='text'
            className='form-control mr-2'
            placeholder='Fabrication Order Search...'
            value={searchText}
            onChange={handleSearchChange}
            style={{
              backgroundColor: '#fff',
              color: '#343a40',
              border: '1px solid #ced4da',
              padding: '10px 15px',
              borderRadius: '20px',
              width: '100%',
              maxWidth: 'calc(100% - 40px)',
              fontSize: '1rem',
              outline: 'none !important',
            }}
          />
          <button
            className='btn btn-warning'
            style={{
              marginLeft: '4px',
              borderRadius: '20px',
              boxShadow: 'none',
            }}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>

        <div className='filter-container d-flex align-items-center mb-4'>
          <label htmlFor='statusFilter' className='mr-2 text-warning'>
            <FontAwesomeIcon icon={faFilter} style={{ fontSize: '1.25rem' }} />
          </label>
          <select
            id='statusFilter'
            className='form-control m-2'
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ maxWidth: '200px' }}>
            <option value='All'>All</option>
            <option value='Not Started'>Not Started</option>
            <option value='In Progress'>In Progress</option>
            <option value='Completed'>Completed</option>
          </select>
        </div>

        <table
          className='table table-hover table-bordered'
          style={{ maxWidth: '800px' }}>
          <thead className='thead-dark'>
            <tr>
              <th scope='col'>OF Number</th>
              <th scope='col'>Article Name</th>
              <th scope='col'>Status</th>
              <th scope='col'>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOfList.map((of) => (
              <tr key={of._id}>
                <td>{of.ofNumber}</td>
                <td>{of.articleName}</td>
                <td style={getStatusStyle(determineOfStatus(of))}>
                  {determineOfStatus(of)}
                </td>
                <td>
                  <button
                    className='btn btn-warning'
                    style={{
                      marginLeft: '10px',
                      borderRadius: '5px',
                      boxShadow: 'none',
                    }}
                    onClick={() => handleShowModal(of)}>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title
              className='text-center'
              style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              Fabrication Order: {selectedOf?.ofNumber}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOf && (
              <>
                <h5 className=' mb-4'>Article : {selectedOf.articleName}</h5>
                {showAlert && (
                  <Alert variant='danger' className='mb-3'>
                    {alertMessage}
                  </Alert>
                )}
                {selectedOf.products.map((product, index) => (
                  <div key={index} className='mb-4'>
                    <h6 className='mb-2' style={{ fontWeight: 'bold' }}>
                      Product : {product.productName}
                    </h6>
                    <h6 className='text-muted mb-2'>
                      Quantity needed: {product.quantity}
                    </h6>
                    <div
                      className={`mb-2 ${
                        isQuantitySufficient(index)
                          ? 'text-success'
                          : 'text-danger'
                      }`}
                      style={{ fontSize: '1rem' }}>
                      {isQuantitySufficient(index)
                        ? 'Sufficient Quantity'
                        : 'Insufficient Quantity'}
                    </div>
                    <div className='d-flex align-items-center mb-3'>
                      <Form.Control
                        type='text'
                        placeholder='Enter code'
                        value={currentCode}
                        onChange={(e) => setCurrentCode(e.target.value)}
                        style={{ marginRight: '10px' }}
                      />
                      <Button
                        variant='warning'
                        onClick={() => handleAddCode(index)}
                        style={{ borderRadius: '5px', boxShadow: 'none' }}>
                        <FontAwesomeIcon icon={faPlus} />
                      </Button>
                      <Button
                        variant='warning'
                        onClick={() => setShowScanner(!showScanner)}
                        style={{
                          borderRadius: '5px',
                          boxShadow: 'none',
                          backgroundColor: 'gray',
                          marginLeft: 2,
                        }}>
                        <FontAwesomeIcon icon={faBarcode} />
                      </Button>
                    </div>
                    <div className='mb-2'>
                      {productCodes[product.productName]?.map((code, idx) => (
                        <Badge
                          key={idx}
                          pill
                          variant='primary'
                          className='mr-1'>
                          {code}
                        </Badge>
                      ))}
                    </div>
                    {showScanner && <BarcodeScanner />}

                    <ProgressBar
                      now={progress(index)}
                      label={`${progress(index).toFixed(2)}%`}
                      className='mb-2'
                      variant='success'
                    />
                    <div className='text-muted'>
                      Remaining Quantity: {remainingQuantity(index)}
                    </div>
                  </div>
                ))}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleCloseModal}>
              Close
            </Button>
            <Button
              variant='warning'
              onClick={handleSaveCodes}
              style={{
                backgroundColor: '#ffc107',
                borderColor: '#ffc107',
                boxShadow: 'none',
              }}>
              Save Codes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  )
}
