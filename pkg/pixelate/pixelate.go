package pixelate
import (
	"cmp"
	"fmt"
	"image"
	"image/color"
	"image/jpeg"
	"image/png"
	"math"
	"os"

	"github.com/ericpauley/go-quantize/quantize"
)

// just put generics in the stdlib already
func Min[T cmp.Ordered](x, y T) T {
	if x < y {
		return x
	}
	return y
}

func DecodeImage(path string) (image.Image, string, error){
	imageFile, err := os.Open(path)
	if err != nil {
		return nil, "", err
	}
	defer imageFile.Close()

	return image.Decode(imageFile)
}

func EncodeImage(filename string, img image.Image, format string) error {
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	switch format {
	case "jpeg", "jpg":
		return jpeg.Encode(file, img, nil)
	case "png":
		return png.Encode(file, img)
	default:
		return fmt.Errorf("unsupported format: %s", format)
	}
}

// Calcmeancolor computes the geometric average of the pixels in a give Rectangle.
func CalcMeanColor(img image.Image, rect image.Rectangle) color.Color {
	var totalR float64
	var totalG float64
	var totalB float64

	var totalPixels = float64(rect.Dx() * rect.Dy())

	for x := rect.Min.X; x < rect.Max.X; x++ {
		for y := rect.Min.Y; y < rect.Max.Y; y++ {
			r, g, b, a := img.At(x, y).RGBA()

			// values have been multiplied by alpha already and need to be normalized back to the
			// 0-256 range
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

func Pixelate(img image.Image, paletteSize, pixelSize int) image.Image {
	q := quantize.MedianCutQuantizer{}
	p := q.Quantize(make([]color.Color, 0, paletteSize), img)

	bounds := img.Bounds()

	resultImg := image.NewRGBA(image.Rect(0, 0, bounds.Max.X, bounds.Max.Y))
	for x := 0; x < bounds.Max.X; x += pixelSize {
		for y := 0; y < bounds.Max.Y; y += pixelSize {
			r := image.Rect(x, y, Min(x+pixelSize, bounds.Max.X), Min(y+pixelSize, bounds.Max.Y))
			m := CalcMeanColor(img, r)
			c := p.Convert(m)
			fillRect(resultImg, r, c)
		}
	}

	return resultImg
}
