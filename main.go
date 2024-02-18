package main

import (
	"flag"
	"fmt"
	"log"
	"github.com/csams/pixelation/pkg/pixelate"
)


func main() {
	input := flag.String("input", "", "file to pixelate")
	output := flag.String("output", "", "output file")
	numColors := flag.Int("colors", 16, "number of colors in the new image")
	pixelWidth := flag.Int("pixel-width", 8, "width of pixels in the new image")

	flag.Parse()

	if *input == "" {
		log.Fatalln("Input file name required.")
	}

	imgData, format, err := pixelate.DecodeImage(*input)
	if err != nil {
		log.Fatalln(err)
	}
	
	outputPath := *output
	if outputPath == "" {
		outputPath = fmt.Sprintf("%s.%s", "output", format)
	}

	resultImg := pixelate.Pixelate(imgData, *numColors, *pixelWidth)
	if err := pixelate.EncodeImage(outputPath, resultImg, format); err != nil {
		log.Fatalln(err)
	}
}
