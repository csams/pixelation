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

type Pixel struct {
	Rect image.Rectangle
	Idx int
}

type PixelImage struct {
	W, H int
	Pixels []Pixel
	Palette []color.RGBA
}

func (p *PixelImage) ToImage() image.Image {
	img := image.NewRGBA(image.Rect(0, 0, p.W, p.H))

	for i := 0; i < len(p.Pixels); i++ {
		pix := p.Pixels[i]
		fillRect(img, pix.Rect, p.Palette[pix.Idx])
	}

	return img
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

			totalR += sr*sr
			totalG += sg*sg
			totalB += sb*sb
		}
	}

	R := uint8(math.Round(math.Sqrt(totalR / totalPixels)))
	G := uint8(math.Round(math.Sqrt(totalG / totalPixels)))
	B := uint8(math.Round(math.Sqrt(totalB / totalPixels)))
	
	return color.RGBA{R, G, B, 255}
}

func fillRect(img *image.RGBA, rect image.Rectangle, c color.Color) {
	for x := rect.Min.X; x < rect.Max.X; x++ {
		for y := rect.Min.Y; y < rect.Max.Y; y++ {
			img.Set(x, y, c)
		}
	}
}

func Pixelate(img image.Image, paletteSize, pixelSize int) *PixelImage {
	q := quantize.MedianCutQuantizer{}
	p := q.Quantize(make([]color.Color, 0, paletteSize), img)

	bounds := img.Bounds()
	resultImg := &PixelImage{
		W: bounds.Dx(),
		H: bounds.Dy(),
		Pixels: make([]Pixel, 0),
		Palette: make([]color.RGBA, len(p)),
	}

	// save the quantized color palette
	for i := 0; i < len(p); i++ {
		c := color.RGBAModel.Convert(p[i]).(color.RGBA)
		resultImg.Palette[i] = c
	}

	for x := 0; x < bounds.Max.X; x += pixelSize {
		for y := 0; y < bounds.Max.Y; y += pixelSize {
			r := image.Rect(x, y, Min(x+pixelSize, bounds.Max.X), Min(y+pixelSize, bounds.Max.Y))
			m := CalcMeanColor(img, r)
			i := p.Index(m)
			pix := Pixel {
				Rect: r,
				Idx: i,
				
			}
			resultImg.Pixels = append(resultImg.Pixels, pix)
		}
	}

	return resultImg
}
