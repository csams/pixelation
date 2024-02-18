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
	hostPort := flag.String("host-port", ":8080", "server parameters")
	render := flag.Bool("render", false, "render a JSON image to some format")
	format := flag.String("format", "jpeg", "Specify the format to render")
	input := flag.String("input", "", "the file to read")
	output := flag.String("output", "", "the file to write")
	colors := flag.Int("colors", 16, "number of colors")
	blockWidth := flag.Int("block-width", 8, "width of blocks in pixels")

	flag.Parse()

	if *shouldServe {
		log.Printf("Listening on %s\n", *hostPort)
		router := serve.ConversionRouter()
		if err := http.ListenAndServe(*hostPort, router); err != nil {
			log.Fatalln(err)
		}
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
		var p pixelate.BlockImage
		if err := json.NewDecoder(f).Decode(&p); err != nil {
			log.Fatalln(err)
		}
		img = p.ToImage()
	} else {
		i, _, err := pixelate.DecodeImage(*input)
		if err != nil {
			log.Fatalln(err)
		}
		img = pixelate.Pixelate(i, *colors, *blockWidth).ToImage()
	}

	pixelate.EncodeImage(outputFile, img, *format)

}
