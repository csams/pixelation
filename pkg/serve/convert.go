package serve

import (
	"encoding/json"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/csams/pixelation/pkg/pixelate"
)

func ConversionRouter(numColors, blockSize int) http.Handler {
	r := chi.NewRouter()
	r.Post("/", func(w http.ResponseWriter, r *http.Request) {
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

		colors := r.FormValue("colors")
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

		BlockSizeParam := r.FormValue("block-size")
		if BlockSizeParam != "" {
			if bs, err := strconv.Atoi(BlockSizeParam); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			} else {
				if bs < 1 {
					http.Error(w, "Blocks must have a least width of 1.", http.StatusBadRequest)
					return
				}
				blockSize = bs
			}
		}

		result := pixelate.Pixelate(imageData, numColors, blockSize)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(result)
	})
	return r
}
