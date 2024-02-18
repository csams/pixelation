package serve

import (
//	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func ConversionRouter(host string) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Post("/convert", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		//json.NewEncoder(w).Encode(result)
	});
	return r
}
