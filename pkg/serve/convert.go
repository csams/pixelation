package serve

import (
	"encoding/json"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/csams/pixelation/pkg/pixelate"
)

func ConversionRouter() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Compress(5))
	r.Post("/convert", func(w http.ResponseWriter, r *http.Request) {
		err := r.ParseMultipartForm(10 << 20) // 10 MB
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Get the file from the form
		file, _, err := r.FormFile("file")
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		defer file.Close()

		numColors := 16
		colors := r.URL.Query().Get("colors")
		if colors != "" {
			if nc, err := strconv.Atoi(colors); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			} else {
				if nc < 2 || nc > 256 {
					http.Error(w, "You must choose at least 2 colors and no more than 256.", http.StatusBadRequest)
					return
				}
				numColors = nc
			}
		}


		imageData, _, err := image.Decode(file)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		blockWidth := 8
		BlockWidthParam := r.URL.Query().Get("blockWidth")
		if BlockWidthParam != "" {
			if pw, err := strconv.Atoi(BlockWidthParam); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			} else {
				if pw < 1 {
					http.Error(w, "Blocks must have a least width of 1.", http.StatusBadRequest)
					return
				}
				blockWidth = pw
			}
		}

		result := pixelate.Pixelate(imageData, numColors, blockWidth)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(result)
	});
	return r
}
