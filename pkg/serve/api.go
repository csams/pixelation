package serve

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func ApiRouter(colors, blockSize int) http.Handler {
	api := chi.NewRouter()
	api.Mount("/convert", ConversionRouter(colors, blockSize))
	return api
}
