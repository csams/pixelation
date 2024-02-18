package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"image"
	"log"
	"net/http"
	"os"

	"github.com/csams/pixelation/pkg/pixelate"
	"github.com/csams/pixelation/pkg/serve"
)

func main() {
	shouldServe := flag.Bool("serve", false, "start the server")
	render := flag.Bool("render", false, "render a JSON image to some format")
	format := flag.String("format", "jpeg", "Specify the format to render")
	input := flag.String("input", "", "the file to read")
	output := flag.String("output", "", "the file to write")
	colors := flag.Int("colors", 16, "number of colors")
	pixelWidth := flag.Int("pixel-width", 8, "width of pixels")

	flag.Parse()

	if *shouldServe {
		router := serve.ConversionRouter()
		http.ListenAndServe(":8080", router)
		return
	}

	if *input == "" {
		log.Fatalln("You must specify an input file name.")
	}

	outputFile := *output
	if *output == "" {
		outputFile = fmt.Sprintf("output.%s", *format)
	}

	var img image.Image
	if *render {
		f, err := os.Open(*input)
		if err != nil {
			log.Fatalln(err)
		}
		var p pixelate.PixelImage
		if err := json.NewDecoder(f).Decode(&p); err != nil {
			log.Fatalln(err)
		}
		img = p.ToImage()
	} else {
		i, _, err := pixelate.DecodeImage(*input)
		if err != nil {
			log.Fatalln(err)
		}
		img = pixelate.Pixelate(i, *colors, *pixelWidth).ToImage()
	}

	pixelate.EncodeImage(outputFile, img, *format)

}
