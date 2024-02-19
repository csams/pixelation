package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"image"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/csams/pixelation/pkg/pixelate"
	"github.com/csams/pixelation/pkg/serve"
)

func main() {
	shouldServe := flag.Bool("serve", false, "start the server")
	hostPort := flag.String("host-port", ":8080", "server parameters")
	colors := flag.Int("colors", 16, "number of colors")
	blockWidth := flag.Int("block-width", 8, "width of blocks in pixels")
	render := flag.Bool("render", false, "render a JSON image to some format")
	format := flag.String("format", "jpeg", "Specify the format to render")
	input := flag.String("input", "", "the file to read")
	output := flag.String("output", "", "the file to write")

	flag.Parse()

	if *shouldServe {
		root := chi.NewRouter()

		root.Use(middleware.RequestID)
		root.Use(middleware.Logger)
		root.Use(middleware.Compress(5))

		// Create a route along /files that will serve contents from
		// the ./data/ folder.
		workDir, _ := os.Getwd()
		filesDir := http.Dir(filepath.Join(workDir, "web"))
		serve.FileServer(root, "/web", filesDir)

		api := serve.ApiRouter(*colors, *blockWidth)
		root.Mount("/api", api)

		log.Printf("Listening on %s\n", *hostPort)
		if err := http.ListenAndServe(*hostPort, root); err != nil {
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
