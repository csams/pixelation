import React, { MouseEvent, useState } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import { BlockCanvas } from './blockcanvas'
import { Image, Color, BlockImage } from './blockimage'
import './style.css'

function FileForm({ setImage }): React.JSX.Element {
  function handleSubmit(event: MouseEvent<HTMLFormElement>): void {
    event.preventDefault()
    const fd = new FormData(document.querySelector('#form') as HTMLFormElement)
    fetch('/api/convert', {
      method: 'post',
      body: fd,
    })
      .then((res: Response) => {
        return res.json()
      })
      .then((doc: BlockImage) => {
        setImage(doc)
      })
  }

  return (
    <Form id='form' name='form' onSubmit={handleSubmit}>
      <Form.Group className='m-2'>
        <Form.Label>Number of colors</Form.Label>
        <Form.Control
          id='colors'
          name='colors'
          type='number'
          defaultValue={16}
          min={2}
          max={256}
        />
        <Form.Text className='text-muted'>
          Choose a number between 2 and 256 inclusive.
        </Form.Text>
      </Form.Group>
      <Form.Group className='m-2'>
        <Form.Label>Number of pixels on the edge of a block</Form.Label>
        <Form.Control
          id='block-size'
          name='block-size'
          type='number'
          defaultValue={8}
          min={1}
          max={256}
        />
        <Form.Text className='text-muted'>
          Choose a number between 1 and 256 inclusive.
        </Form.Text>
      </Form.Group>
      <Form.Group className='m-2'>
        <Form.Control
          id='file'
          name='file'
          type='file'
          accept='.png, .jpg, .jpeg'
        />
      </Form.Group>
      <Button className='m-2' type='submit'>
        Submit
      </Button>
    </Form>
  )
}

function Palette({ palette, paletteIndex, setPaletteIndex }) {
  if (palette.length === 0) {
    return <></>
  }
  let rows = new Array()
  let cols = new Array()
  let wrapLength = 8
  palette.forEach((color: Color, i: number) => {
    let idx = i
    if (i > 0 && i % wrapLength === 0) {
      rows.push(
        <Row className='m-2' key={i}>
          {cols}
        </Row>,
      )
      cols = new Array()
    }
    let style = {
      backgroundColor: `rgba(${color.R}, ${color.G}, ${color.B})`,
      width: '100%',
    }
    let colClass = paletteIndex === i ? 'col-md m-2 p-2 shadow bg-secondary-subtle rounded' : 'col-md m-2 p-2'
    cols.push(
      <Col key={i} className={colClass}>
        <Button
          className='btn btn-lg'
          style={style}
          onClick={() => setPaletteIndex(idx)}
        ><span style={{padding: "2px", color: "black", backgroundColor: "white", border: "1px"}}>{`${i + 1}`}</span></Button>
      </Col>,
    )
  })

  if (cols.length > 0) {
    while (cols.length < wrapLength) {
      cols.push(<Col key={cols.length} className='col-sm m-2 p-2'></Col>)
    }
    rows.push(
      <Row className='m-2' key={rows.length - 1}>
        {cols}
      </Row>,
    )
  }

  return <Container fluid={true}>{rows}</Container>
}

export default function App() {
  let [image, setImage] = useState(new Image())
  let [paletteIndex, setPaletteIndex] = useState(0)

  const spi = (i: React.SetStateAction<number>) => {
    console.log(`Setting to ${i}`)
    return setPaletteIndex(i)
  }

  return (
    <Container fluid={true}>
      <Row className='m-2'>
        <Col className='m-2'>
          <FileForm setImage={setImage} />
        </Col>
      </Row>
      <Row className='m-2'>
        <Col className='m-2'>
          <Palette
            palette={image.Palette}
            paletteIndex={paletteIndex}
            setPaletteIndex={spi}
          />
        </Col>
      </Row>
      <Row className='m-2'>
        <BlockCanvas image={image} paletteIndex={paletteIndex} />
      </Row>
    </Container>
  )
}
