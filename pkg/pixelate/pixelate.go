package pixelate

import (
	"cmp"
	"image"
	"image/color"
	"math"

	"github.com/ericpauley/go-quantize/quantize"
)

// just put generics in the stdlib already
func Min[T cmp.Ordered](x, y T) T {
	if x < y {
		return x
	}
	return y
}

// Block represents a group of pixels from the original image that have all been converted to a single color.
// A Block is a big pixel.
type Block struct {
	Rect image.Rectangle
	Idx  int
}

// Grid is a 2D arrangement of Blocks, like pixels in an image
type Grid [][]Block

type BlockImage struct {
	W, H      int
	BlockSize int
	Grid      Grid
	Palette   []color.RGBA
}

// ToImage creates an image.Image from the BlockImage
func (p *BlockImage) ToImage() image.Image {
	img := image.NewRGBA(image.Rect(0, 0, p.W, p.H))

	for r := 0; r < len(p.Grid); r++ {
		row := p.Grid[r]
		for c := 0; c < len(row); c++ {
			block := row[c]
			fillRect(img, block.Rect, p.Palette[block.Idx])
		}
	}

	return img
}

func fillRect(img *image.RGBA, rect image.Rectangle, c color.Color) {
	for x := rect.Min.X; x < rect.Max.X; x++ {
		for y := rect.Min.Y; y < rect.Max.Y; y++ {
			img.Set(x, y, c)
		}
	}
}

// CalcMeanColor computes the geometric average of the pixels in a given image.Rectangle.
func CalcMeanColor(img image.Image, rect image.Rectangle) color.Color {
	var totalR float64
	var totalG float64
	var totalB float64

	var totalPixels = float64(rect.Dx() * rect.Dy())

	for x := rect.Min.X; x < rect.Max.X; x++ {
		for y := rect.Min.Y; y < rect.Max.Y; y++ {
			r, g, b, a := img.At(x, y).RGBA()

			// values have been multiplied by alpha already and need to be normalized back to the
			// 0-255 range
			af := float64(a)
			sr := float64(r) / af * 255
			sg := float64(g) / af * 255
			sb := float64(b) / af * 255

			totalR += sr * sr
			totalG += sg * sg
			totalB += sb * sb
		}
	}

	R := uint8(math.Round(math.Sqrt(totalR / totalPixels)))
	G := uint8(math.Round(math.Sqrt(totalG / totalPixels)))
	B := uint8(math.Round(math.Sqrt(totalB / totalPixels)))

	return color.RGBA{R, G, B, 255}
}

// Pixelate converts and Image into a BlockImage of the specified block size and number of colors
func Pixelate(img image.Image, numColors, blockSize int) *BlockImage {
	q := quantize.MedianCutQuantizer{}
	p := q.Quantize(make([]color.Color, 0, numColors), img)

	bounds := img.Bounds()
	resultImg := &BlockImage{
		W:         bounds.Dx(),
		H:         bounds.Dy(),
		BlockSize: blockSize,
		Grid:      make([][]Block, 0),
		Palette:   make([]color.RGBA, len(p)),
	}

	// save the quantized color palette
	for i := 0; i < len(p); i++ {
		c := color.RGBAModel.Convert(p[i]).(color.RGBA)
		resultImg.Palette[i] = c
	}

	// build up the image
	for y := 0; y < bounds.Max.Y; y += blockSize {
		row := make([]Block, 0)
		for x := 0; x < bounds.Max.X; x += blockSize {
			r := image.Rect(x, y, Min(x+blockSize, bounds.Max.X), Min(y+blockSize, bounds.Max.Y))
			m := CalcMeanColor(img, r)
			i := p.Index(m)
			block := Block{
				Rect: r,
				Idx:  i,
			}
			row = append(row, block)
		}
		if len(row) > 0 {
			resultImg.Grid = append(resultImg.Grid, row)
		}
	}

	return resultImg
}
