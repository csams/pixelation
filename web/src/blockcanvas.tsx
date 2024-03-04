import React, { useEffect, useState } from 'react'
import { MouseEvent } from 'react'
import Button from 'react-bootstrap/Button'

import { Block, Point } from './blockimage'

function BlockCanvas({ image, paletteIndex }) {
  const [down, setDown] = useState(false)
  useEffect(() => {
    clear()
    render()
  }, [image])
  useEffect(() => {
    render()
  }, [paletteIndex])

  function render(): void {
    let canvas = document.querySelector('#canvas') as HTMLCanvasElement
    canvas.width = image.W
    canvas.height = image.H
    with2dContext((c) => {
      c.clearRect(0, 0, canvas.width, canvas.height)
      image.Grid.forEach((row) =>
        row.forEach((block) => {
          paintBlock(c, block)
        }),
      )
    })
  }

  function clear(): void {
    image.Font = `${image.BlockSize}px serif`
    image.Grid.forEach((row) =>
      row.forEach((block: Block) => {
        block.Filled = false
      }),
    )
  }

  function paintBlock(c: CanvasRenderingContext2D, block: Block): void {
    let rect = block.Rect
    let p = image.Palette[block.Idx]
    if (block.Filled) {
      let color = `rgb(${p.R}, ${p.G}, ${p.B})`
      c.fillStyle = color
      c.strokeStyle = color
      c.fillRect(
        rect.Min.X,
        rect.Min.Y,
        rect.Max.X - rect.Min.X,
        rect.Max.Y - rect.Min.Y,
      )
    } else {
      let d = Math.floor(image.BlockSize / 2)
      let color =
        block.Idx === paletteIndex
          ? `rgb(${p.R}, ${p.G}, ${p.B})`
          : `rgba(0,0,0,0.3)`
      c.textAlign = 'center'
      c.fillStyle = color
      c.strokeStyle = color
      c.font = image.Font
      c.lineWidth = 1
      c.strokeRect(
        rect.Min.X,
        rect.Min.Y,
        rect.Max.X - rect.Min.X,
        rect.Max.Y - rect.Min.Y,
      )
      c.fillText(
        `${block.Idx + 1}`,
        rect.Min.X + d,
        rect.Min.Y + image.BlockSize,
        image.BlockSize - 1,
      )
    }
  }

  function handleClear() {
    clear()
    render()
  }

  function handleFloodFill() {
    image.Grid.forEach((row) =>
      row.forEach((block: Block) => {
        block.Filled = true
      }),
    )
    render()
  }

  function with2dContext(f: (c: CanvasRenderingContext2D) => void) {
    let canvas = document.querySelector('#canvas') as HTMLCanvasElement
    let c = canvas.getContext('2d') as CanvasRenderingContext2D

    if (!c) {
      console.log("Couldn't get canvas context.")
      return
    }
    f(c)
  }

  function getGridLocation(event: MouseEvent): Point {
    let canvas = document.querySelector('#canvas') as HTMLCanvasElement
    let elem = canvas,
      elemLeft = elem.offsetLeft + elem.clientLeft,
      elemTop = elem.offsetTop + elem.clientTop

    let x = event.pageX - elemLeft,
      y = event.pageY - elemTop

    x = Math.floor(x / image.BlockSize)
    y = Math.floor(y / image.BlockSize)
    return { X: x, Y: y }
  }

  function flood(point: Point): void {
    let blocks = new Array<Block>()
    let stack = new Array<Point>()

    let block: Block = image.Grid[point.Y][point.X]
    if (block.Filled || block.Idx !== paletteIndex) {
      return
    }

    stack.push(point)

    while (stack.length > 0) {
      let pt = stack.pop()

      if (pt != null) {
        block = image.Grid[pt.Y][pt.X]
        block.Filled = true
        blocks.push(block)

        // fill left
        if (pt.X - 1 >= 0) {
          let other = image.Grid[pt.Y][pt.X - 1]
          if (block.Idx === other.Idx && !other.Filled) {
            stack.push({ X: pt.X - 1, Y: pt.Y })
          }
        }

        // fill right
        if (pt.X + 1 < image.Grid[pt.Y].length) {
          let other = image.Grid[pt.Y][pt.X + 1]
          if (block.Idx === other.Idx && !other.Filled) {
            stack.push({ X: pt.X + 1, Y: pt.Y })
          }
        }

        // fill up
        if (pt.Y - 1 >= 0) {
          let other = image.Grid[pt.Y - 1][pt.X]
          if (block.Idx === other.Idx && !other.Filled) {
            stack.push({ X: pt.X, Y: pt.Y - 1 })
          }
        }

        // fill down
        if (pt.Y + 1 < image.Grid.length) {
          let other = image.Grid[pt.Y + 1][pt.X]
          if (block.Idx === other.Idx && !other.Filled) {
            stack.push({ X: pt.X, Y: pt.Y + 1 })
          }
        }
      } else {
        break
      }
    }

    with2dContext((c) => {
      blocks.forEach((block) => {
        paintBlock(c, block)
      })
    })
  }

  function handleDoubleClick(event: MouseEvent<HTMLCanvasElement>): void {
    event.preventDefault()
    let pt = getGridLocation(event)
    flood(pt)
  }

  function handleClick(event: MouseEvent): void {
    event.preventDefault()

    let pt = getGridLocation(event)

    image.Grid[pt.Y][pt.X].Filled = true
    render()
  }

  function handleMouseMove(event: MouseEvent<HTMLCanvasElement>): void {
    if (down) {
      event.preventDefault()

      let pt = getGridLocation(event)
      let block = image.Grid[pt.Y][pt.X]
      if (block.Idx == paletteIndex) {
        block.Filled = true
        with2dContext((c) => paintBlock(c, block))
      }
    }
  }

  function handleMouseDown(event: MouseEvent<HTMLCanvasElement>): void {
    if (event.detail > 1) {
      event.preventDefault()
    }
    setDown(true)
  }

  function handleMouseUp(): void {
    setDown(false)
  }

  return (
    <div id='picture' className='picture-container'>
      <div className='m-2' style={{ display: 'block' }}>
        <Button className='m-2' onClick={handleFloodFill}>
          Fill
        </Button>
        <Button className='m-2' onClick={handleClear}>
          Clear
        </Button>
      </div>
      <div className='m-2' style={{ display: 'block' }}>
        <canvas
          id='canvas'
          className='picture'
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onDoubleClick={handleDoubleClick}
        />
      </div>
    </div>
  )
}

export { BlockCanvas }
