import React, { MouseEvent, useState } from 'react'

import Container from 'react-bootstrap/Container'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import { BlockCanvas } from './lib'
import { Image, Color, BlockImage } from './types'
import './style.css'

function FileForm({ setImage}): React.JSX.Element {
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
      <Form.Group>
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
      <Form.Group>
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
      <Form.Group>
        <Form.Control
          id='file'
          name='file'
          type='file'
          accept='.png, .jpg, .jpeg'
        />
      </Form.Group>
      <Button type='submit'>Submit</Button>
    </Form>
  )
}

function Palette(palette: Color[]) {
  return <div></div>
}

export default function App() {
  let [image, setImage] = useState(new Image())

  return (
    <Container fluid={true}>
      <FileForm setImage={setImage} />
      <BlockCanvas image={image} />
    </Container>
  )
}
