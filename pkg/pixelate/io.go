package pixelate

import (
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"os"
)

// DecodeImage reads an image from a path on the filesystem and returns an image.Image or error
func DecodeImage(path string) (image.Image, string, error){
	imageFile, err := os.Open(path)
	if err != nil {
		return nil, "", err
	}
	defer imageFile.Close()

	return image.Decode(imageFile)
}

// EncodeImage writes an image to the filesystem in the given format and returns an error if unsuccessful
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

